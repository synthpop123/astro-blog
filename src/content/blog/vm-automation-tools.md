---
author: lkw123
pubDatetime: 2024-03-27T10:00:00Z
title: 使用 PyVmomi 构建 VMWare 自动化工具
slug: vm-automation-tools
featured: false
draft: false
tags:
  - VMWare
  - Automation
  - Python
  - DevOps
description: Using PyVmomi to build some useful VMWare automation tools
---

## Table of Contents

## Basic utils

```python
from argparse import ArgumentParser

def parse_arguments():
    # 以 Add Port Group 为例
    parser = ArgumentParser(description="Add port group to a cluster in vCenter")

    parser.add_argument("--vc-ip", dest="vc_ip", type=str, required=True, help="vCenter IP address")
    parser.add_argument("-u", "--username", dest="username", type=str, default="vc_username", help="vCenter username")
    parser.add_argument("-p", "--password", dest="password", type=str, default="vc_password", help="vCenter password")
    parser.add_argument("-c", "--cluster", dest="cluster", type=str, required=True, help="Cluster name")
    parser.add_argument("-n", "--vlan-name", dest="vlanname", type=str, required=True, help="Name of the VLAN")
    parser.add_argument("-i", "--vlan-id", dest="vlanid", type=int, required=True, help="VLAN ID")
    parser.add_argument("-v", "--vswitch", dest="vswitch", type=str, required=True, help="Name of the vSwitch")

    return parser.parse_args()
```

```python
def init_connection(vc_ip, username, password):
    """
    初始化与 vCenter 的连接

    :param vc_ip: vCenter 的 IP 地址
    :param username: 登录用户名
    :param password: 登录密码
    :return: vCenter 的内容对象
    """
    service_instance = connect.Connect(
        host=vc_ip, port=443, user=username, pwd=password, disableSslCertValidation=True
    )
    atexit.register(connect.Disconnect, service_instance)
    content = service_instance.RetrieveContent()
    return content
```

```python
def get_obj(content, vimtype, name=None):
    """
    从 vc 的内容中获取指定类型的对象列表

    :param content: vCenter 内容对象
    :param vimtype: 要获取的对象类型
    :param name: 对象名称，可选
    :return: 匹配的对象列表
    """
    container = content.viewManager.CreateContainerView(
        content.rootFolder, vimtype, True
    )

    if name is not None:
        objects = [view for view in container.view if name and view.name == name]
    else:
        objects = [view for view in container.view]

    return objects
```

```python
# 连接到 VC 获取相关信息
vc_content = init_connection(vc_ip, username, password)

# 一些常用对象的获取
host_obj = get_obj(vc_content, [vim.HostSystem])
vm_obj = get_obj(vc_content, [vim.VirtualMachine])
cluster_obj = get_obj(vc_content, [vim.ClusterComputeResource])
ds_obj = get_obj(vc_content, [vim.Datastore])
```

## Add Virtual Disk

```python
def add_disk(vm, disk_size, ds):
    """
    虚拟机加盘

    :param vm: 虚拟机对象
    :param disk_size: 加盘的大小
    :param ds: 加盘所属的 Datastore
    :return: None
    """
    # 默认磁盘类型为 thick
    disk_type ='thick'
    ds_name = ds.summary.name
    path_on_ds = '[' + ds_name + ']' + vm.name

    # get all disks on a VM, set unit_number to the next available
    for dev in vm.config.hardware.device:
        if hasattr(dev.backing, 'fileName'):
            unit_number = int(dev.unitNumber) + 1
            # unit_number 7 reserved for scsi controller
            if unit_number == 7:
                unit_number += 1
            if unit_number >= 16:
                logging.error("We don't support this many disks")
                return
        if isinstance(dev, vim.vm.device.VirtualSCSIController):
            controller = dev

    spec = vim.vm.ConfigSpec()
    device_change = []
    disk_spec = vim.vm.device.VirtualDeviceSpec()
    disk_spec.fileOperation = "create"
    disk_spec.operation = vim.vm.device.VirtualDeviceSpec.Operation.add
    disk_spec.device = vim.vm.device.VirtualDisk()
    disk_spec.device.backing = \
        vim.vm.device.VirtualDisk.FlatVer2BackingInfo()
    if disk_type == 'thin':
        disk_spec.device.backing.thinProvisioned = True
    disk_spec.device.backing.diskMode = "persistent"
    disk_spec.device.backing.datastore = ds
    disk_spec.device.backing.fileName = path_on_ds + '/' + vm.name + '_' + str(unit_number) + '.vmdk'
    disk_spec.device.unitNumber = unit_number
    disk_spec.device.capacityInKB = int(disk_size) * 1024 * 1024 # GB to KB
    disk_spec.device.controllerKey = controller.key

    device_change.append(disk_spec)
    spec.deviceChange = device_change
    vm.ReconfigVM_Task(spec=spec)
    logging.info(f"虚拟机 {vm.name} 已加盘，加盘大小为 {disk_size} GB")
    logging.info(f"所属 Datastore 为 {ds.name}")
```

```python
def add_disk_to_vm(vmname, vmip, size):
    """
    单台虚拟机加盘

    :param vmname: 虚拟机名称
    :param vmip: 虚拟机 IP
    :param size: 加盘大小
    :return: None
    """
    logging.info(f"确认执行参数：vmname:{vmname} vmip:{vmip} size:{size}")

    # 从数据库表中获取对应虚机的相关信息 (vc_ip, from_cluster)
    vc, cluster = get_vminfo(vmname, vmip)
    username = "vc_username"
    password = "vc_password"

    # 连接到所属 VC
    vc_content = init_connection(vc_ip=vc, username=username, password=password)
    logging.info(f"********** 已连接至 VC {vc} **********")

    # 找到所属 Cluster 的全部 Datastore
    cluster_obj = get_obj(vc_content, [vim.ClusterComputeResource], cluster)
    if cluster_obj is None:
        logging.error(f"未找到目标 Cluster: {cluster}")
        return
    datastore_obj = cluster_obj[0].datastore

    # 筛选出剩余容量最大的 Datastore
    max_freespace_ds = None
    max_freespace = 0
    for ds_obj in datastore_obj:
        # 排除本地 Datastore
        if ds_obj.summary.multipleHostAccess is True:
            freespace = 0

            freespace += ds_obj.summary.freeSpace
            freespace -= ds_obj.summary.uncommitted if ds_obj.summary.uncommitted is not None else 0
            # 更新最大剩余容量的 Datastore 对象
            if freespace > max_freespace:
                max_freespace_ds = ds_obj
                max_freespace = freespace

    logging.info(f"已找到剩余容量最大的 Datastore: {max_freespace_ds.summary.name}")
    logging.info(f"剩余容量为 {max_freespace / (1024**3):.1f} GB，总容量为 {max_freespace_ds.summary.capacity / (1024**3)} GB")

    # 判断执行加盘操作后 Datastore 使用率是否超过 80%
    if (((freespace / (1024**3)) - int(size)) / (max_freespace_ds.summary.capacity / (1024**3))) * 100 < 20:
        logging.error("加盘失败：加盘后 Datastore 使用率超过 80%")
        return

    # 执行加盘操作
    vm_obj = get_obj(vc_content, [vim.VirtualMachine], vmname)
    if vm_obj is None:
        logging.error(f"未找到虚拟机 {vmname}")
        return
    add_disk(vm_obj[0], size, max_freespace_ds)
```

## Add Port Group to Cluster

```python
# 连接到 VC 获取相关信息
vc_content = init_connection(vc_ip, username, password)

# 获取该 VC 中对应的 cluster 对象
cluster_obj = get_obj(vc_content, [vim.ClusterComputeResource], cluster)
if cluster_obj is None:
    logging.error(f"未找到目标 Cluster: {cluster}")
    return
logging.info(f"已连接至 VC: {vc_ip}，并获取到 Cluster 对象")

# 获取该 Cluster 中的所有宿主机
host_list = cluster_obj[0].host
for host in host_list:
    logging.info(f"宿主机 {host.name} 开始配置")

    portgroup_spec = vim.host.PortGroup.Specification()
    portgroup_spec.vswitchName = vswitch.strip()
    portgroup_spec.name = vlanname.strip()
    portgroup_spec.vlanId = vlanid

    network_policy = vim.host.NetworkPolicy()
    network_policy.security = vim.host.NetworkPolicy.SecurityPolicy()
    # network_policy.security.allowPromiscuous = False
    # network_policy.security.macChanges = True
    # network_policy.security.forgedTransmits = True
    portgroup_spec.policy = network_policy

    host.configManager.networkSystem.AddPortGroup(portgroup_spec)

    logging.info(f"宿主机 {host.name} 配置完成")
```

## Add vSwitch to Host

```python
# 连接到 VC 获取相关信息
vc_content = init_connection(vc_ip, username, password)

# 获取该 VC 中所有的 host 对象
host_obj = get_obj(vc_content, [vim.HostSystem], host)
if host_obj is None:
    logging.error(f"未找到目标宿主机 {host}")
    return
logging.info(f"已连接至 VC: {vc_ip}，并获取到 host 对象")

obj = host_obj[0]
vswitch_spec = vim.host.VirtualSwitch.Specification()

vswitch_spec.numPorts = 1024
vswitch_spec.mtu = 1450

network_policy = vim.host.NetworkPolicy()
network_policy.security = vim.host.NetworkPolicy.SecurityPolicy()
# network_policy.security.allowPromiscuous = False
# network_policy.security.macChanges = True
# network_policy.security.forgedTransmits = True
vswitch_spec.policy = network_policy

obj.configManager.networkSystem.AddVirtualSwitch(vswitch, vswitch_spec)
logging.info(f"宿主机 {host} 添加 vSwitch {vswitch} 完成")
```
