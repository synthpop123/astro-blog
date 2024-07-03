---
author: lkw123
pubDatetime: 2024-01-10T10:00:00+08:00
title: 使用 PyVmomi 获取 VMWare 虚拟化集群信息
slug: vc-info-parse
featured: true
draft: false
tags:
  - VMWare
  - Python
  - DevOps
description: Using PyVmomi to parse all kinds of info from VMWare vCenter
---

## Table of contents

## 背景

在生产实践中，需要对 VMWare 虚拟化集群进行监控，并对其中的虚拟机进行自动化管理。

[PyVmomi](https://github.com/vmware/pyvmomi) 作为 VMWare 官方提供的开源 Python SDK，它提供了丰富的 API 接口，便于开发者获取集群信息、虚拟机信息等，以及对虚拟机进行各种操作。

## 信息获取

### 基本方法

在初始化与 VMWare vCenter 的连接的过程中，需要注意的一点是，自 PyVmomi v8.0 起，`connect.ConnectNoSSL()` and `connect.SmartConnectNoSSL()` 方法已被[移除](https://github.com/vmware/pyvmomi/releases/tag/v8.0.0.1)，解决方式是在常规的连接方法中增加 `disableSslCertValidation=True` 选项。

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

### 获取宿主机信息

```python
from math import ceil

def query_host_info(esxi):
    """
    查询 ESXi 主机的信息 (vimtype = 'HostSystem')

    :param esxi: ESXi 主机对象
    :return: ESXi 主机的信息
    """
    host_info = {
        "ip": esxi.name,
        "vc_ip": esxi.summary.managementServerIp,
        "in_maintenance_mode": esxi.runtime.inMaintenanceMode,
        "processor_usage/%": "%.1f"
        % (
            esxi.summary.quickStats.overallCpuUsage
            / (
                esxi.summary.hardware.numCpuPkgs
                * esxi.summary.hardware.numCpuCores
                * esxi.summary.hardware.cpuMhz
            )
            * 100
        ),  # 处理器使用率
        "memory/GB": ceil(esxi.summary.hardware.memorySize / (1024**3)),  # 内存 (GB)
        "memory_usage/%": "%.1f"
        % (
            (
                esxi.summary.quickStats.overallMemoryUsage
                / (esxi.summary.hardware.memorySize / (1024**2))
            )
            * 100
        ),  # 内存使用率
        "cpu_total_cores": esxi.hardware.cpuInfo.numCpuCores,
        "from_cluster": esxi.parent.name,
    }

    return host_info
```

### 获取虚拟机信息

在获取虚拟机的磁盘信息时，虚拟磁盘的名称和大小并不是我们关注的重点。除了直观的计算出当前虚拟机的磁盘总容量外，通过格式化输出虚拟机分配的数据存储 LUN 的名称列表，可以便捷的对某一特定存储所关联的虚拟机进行筛选，进而对虚拟机所关联的业务、软件应用等进行归类管理。

```python
def calculate_vm_disk_size(vm):
    """
    计算虚拟机磁盘大小
    """
    vm_disk_size = sum(d.capacityInKB / (1024**2) for d in vm.config.hardware.device if isinstance(d, vim.vm.device.VirtualDisk))
    # 去重
    from_lun = {d.backing.datastore.info.name for d in vm.config.hardware.device if isinstance(d, vim.vm.device.VirtualDisk)}
    # 排序
    sorted_from_lun = sorted(from_lun, key=str)
    # 格式化输出
    formatted_from_lun = ", ".join(map(str, sorted_from_lun))
    return vm_disk_size, formatted_from_lun
```

```python
def extract_ip(vm):
    """
    提取虚拟机的IP地址
    """
    ip = ""
    try:
        if vm.guest.ipAddress:
            # 遍历网卡
            for nic in vm.guest.net:
                address = nic.ipConfig.ipAddress
                for addr in address:
                    tip = addr.ipAddress
                    # 只筛选 10、122、172 开头的
                    if tip.startswith(("10.", "172.", "122.")):
                        return tip
    except Exception as e:
        logging.error(f"Error while extracting IP for VM {vm.name}")
        logging.error(e)
    return ip
```

```python
def query_vm_info(vm, vc_ip):
    """
    查询虚拟机的信息
    """
    try:
        vm_disk_size, formatted_from_lun = calculate_vm_disk_size(vm)
    except Exception:
        logging.error(f"Error while calculating disk size for VM {vm.name}")
        return

    ip = extract_ip(vm)

    try:
        mem = getattr(vm.config.hardware, 'memoryMB', 0)
    except Exception:
        logging.error(f"Error while getting mem for VM {vm.name}")
        mem = 0

    try:
        cpu_num = vm.config.hardware.numCPU
    except Exception:
        logging.error(f"Error while getting CPU for VM {vm.name}")
        cpu_num = 0

    vm_info = {
        "name": vm.name,  # vm-vmw73491-apc
        "ip": ip,  # 需要服务器开机后才可以获取
        "vc_ip": vc_ip, # vCenter 的 IP 地址
        "vm_name": vm.config.name,  # vm-vmw73491-apc
        "power_state": vm.runtime.powerState,  # poweredOn
        "cpu_num": cpu_num,  # 2
        "memory": mem,  # 8192 MB
        "disk_size": ceil(vm_disk_size),  # 所有虚拟磁盘容量相加 GB
        "from_host": vm.runtime.host.name,  # 所属的宿主机
        "from_host_name": vm.runtime.host.config.network.dnsConfig.hostName, # 所属虚拟机的主机名
        "from_cluster": vm.runtime.host.parent.name,  # 所属的 Cluster
        "from_lun": formatted_from_lun,  # 每个虚拟磁盘的 lun，去重排序
    }

    return vm_info
```

### 获取集群信息

```python
from math import ceil

def query_cluster_info(cluster, vc_ip):
    """
    创建 Cluster 视图，返回 Cluster 关键信息

    :param cluster: 所需查询的 cluster_obj
    :param vc_ip: 当前 VC IP
    :return: 当前 Cluster 的信息
    """
    # 获取主机和虚机的列表
    host_list = cluster.host
    host_num = cluster.summary.numHosts
    vm_list = cluster.resourcePool.vm
    vm_num = len(vm_list)

    # 计算超授比
    oversub_ratio = round(vm_num / host_num) if host_num != 0 else 0

    # 计算 CPU 数
    cpu_num = cluster.summary.numCpuCores

    # 计算已分配 CPU 数
    assigned_cpu_num = 0
    for vm in vm_list:
        try:
            assigned_cpu_num += vm.config.hardware.numCPU
        except AttributeError:
            assigned_cpu_num += 0

    # 计算 CPU 超授比
    cpu_oversub_ratio = (
        round(assigned_cpu_num / cpu_num, 1) if assigned_cpu_num != 0 else 0
    )

    # 用于计算 CPU 使用率
    cpu_used = sum(host.summary.quickStats.overallCpuUsage or 0 for host in host_list)

    # 计算内存总量 / 已分配内存 / 已使用内存
    total_memory = ceil(cluster.summary.totalMemory / (1024**3))
    total_assigned_memory = 0
    for vm in vm_list:
        try:
            total_assigned_memory += int(vm.config.hardware.memoryMB / 1024)
        except AttributeError:
            total_assigned_memory += 0
    total_used_memory = sum(
        int((host.summary.quickStats.overallMemoryUsage or 0) / 1024)
        for host in cluster.host
    )

    # 计算内存超授比
    mem_oversub_ratio = (
        round(total_assigned_memory / total_memory, 1)
        if total_assigned_memory != 0
        else 0
    )

    # 计算容量 / 剩余空间
    capacity = freespace = 0
    for ds in cluster.datastore:
        if ds.summary.multipleHostAccess is True:
            capacity += ds.summary.capacity
            freespace += ds.summary.freeSpace
            freespace -= (
                ds.summary.uncommitted if ds.summary.uncommitted is not None else 0
            )

    # 构建 cluster_info dict
    cluster_info = {
        "name": cluster.name, # 集群名
        "vc_ip": vc_ip, # vCenter 的 IP 地址
        "host_num": host_num,  # 主机数
        "vm_num": vm_num,  # 虚机数
        "oversub_ratio": f"1:{oversub_ratio}" if oversub_ratio != 0 else "1:1",  # 超授比
        "cpu_num": cpu_num,  # CPU 数
        "assigned_cpu_num": assigned_cpu_num,  # 已分配 CPU 数
        "cpu_oversub_ratio": f"1:{cpu_oversub_ratio}"
        if cpu_oversub_ratio != 0
        else "N/A",  # CPU 超授比
        "cpu_usage/%": "%.1f" % (cpu_used / cluster.summary.totalCpu * 100),  # CPU 使用率
        "total_memory/GB": total_memory,  # 总内存/GB
        "total_assigned_memory/GB": total_assigned_memory,  # 已分配内存/GB
        "total_used_memory/GB": total_used_memory,  # 已使用内存/GB
        "mem_oversub_ratio": f"1:{mem_oversub_ratio}"
        if mem_oversub_ratio != 0
        else "1:0.0",  # 内存超授比
        "mem_usage/%": "%.1f" % (total_used_memory / total_memory * 100),  # 内存使用率
        "capacity/TB": ceil(capacity / (1024**4)),  # TB
        "freespace/GB": int(freespace / (1024**3)),  # GB
        "uncommitted/GB": int(uncommitted / (1024**3)),  # GB
        "storage_usage/%": "%.1f" % ((1 - freespace / capacity) * 100) if capacity != 0 else 0,
    }

    return cluster_info
```

### 获取数据存储信息

由于从数据存储对象无法直接获取其所属的 Cluster，因此需要先构建一个 Cluster 和 LUN 相对应的字典，在遍历数据存储对象的时候从字典中反查得到其所属的集群。

```python
def init_cluster_lun(cluster_obj):
    """
    初始化 Cluster 和 LUN 对应的字典

    :param cluster_obj: cluster 列表
    :return: None
    """
    global cluster_lun

    for cluster in cluster_obj:
        for ds in cluster.datastore:
            cluster_lun[ds.summary.name] = cluster.name
```

```python
def query_datastore_info(ds, vc_ip):
    """
    查询数据存储的信息 (vimtype = 'Datastore')

    :param ds: 数据存储对象
    :param vc_ip: 当前 VC IP
    :return: 数据存储的信息
    """
    if ds.summary.multipleHostAccess is False:
        # print("跳过本地磁盘:", ds.summary.name)
        return

    uncommitted = int(ds.summary.uncommitted / (1024**3)) if ds.summary.uncommitted is not None else 0

    ds_info = {
        "name": ds.summary.name,
        "vc_ip": vc_ip,
        "capacity/GB": ceil(ds.summary.capacity / (1024**3)),
        "freespace/GB": int(ds.summary.freeSpace / (1024**3)) - uncommitted,
        "from_cluster": cluster_lun.get(ds.summary.name, ""),
    }

    return ds_info
```

## 数据展示

### 输出到控制台

为了在开发过程中便于调试，可以将获取到的信息视图输出到控制台。以数据存储信息为例：

```python
# 输出数据存储信息
for i, ds in enumerate(ds_obj):
    ds_info = query_datastore_info(ds, vc_ip)
    if ds_info is not None:
        print(
            json.dumps(
                ds_info,
                indent=4,
                ensure_ascii=False,
                default=str,
            )
        )
    if i == 5:
        break
```

### 输出到表格文件

为了将多个信息视图展示在一个 Excel 文件中，在处理每个信息视图的过程中，可以对目标 Excel 工作表的名称进行指定，这样不同类的信息视图可以分别存储在不同的 tab 中。

```python
import openpyxl

def write_dict_list_to_excel(dict_list, sheet_title):
    """
    将字典列表写入 Excel 文件

    :param dict_list: 包含字典元素的列表
    :param sheet_title: 工作表标题
    :return: None
    """
    # 检查工作表是否已存在
    if sheet_title in workbook.sheetnames:
        # 获取已存在的工作表
        sheet = workbook[sheet_title]
    else:
        # 创建新的工作表
        sheet = workbook.create_sheet(title=sheet_title)

        # 将字典列表的 key 作为表头写入第一行
        headers = list(dict_list[0].keys())
        sheet.append(headers)

    # 将字典列表的 value 写入 Excel 文件
    for data in dict_list:
        sheet.append(list(data.values()))
```

在处理表格文件输出时，首先需要完成如下步骤：

```python
# 创建新的工作簿
workbook = openpyxl.Workbook()
sheet = workbook.active

# 删除默认的 Sheet 工作表
if "Sheet" in workbook.sheetnames:
    workbook.remove(workbook["Sheet"])
```

分别处理每个信息视图：

```python
# 输出宿主机信息
host_list = []
for obj in host_obj:
    host_list.append(query_host_info(obj))
write_dict_list_to_excel(host_list, "宿主机信息")

# 输出虚拟机信息
vm_list = []
for obj in vm_obj:
    vm_list.append(query_vm_info(obj, vc_ip))
write_dict_list_to_excel(vm_list, "虚拟机信息")

# 输出集群信息
cluster_list = []
for obj in cluster_obj:
    cluster_list.append(query_cluster_info(obj, vc_ip))
write_dict_list_to_excel(cluster_list, "集群信息")

# 输出数据存储信息
# 创建 Cluster 和 datastore (LUN_name) 对应的字典
init_cluster_lun(cluster_obj)
ds_list = []
for obj in ds_obj:
    ds_list.append(query_datastore_info(obj, vc_ip))
write_dict_list_to_excel(ds_list, "数据存储信息")

# 将表格存储到磁盘
workbook.save("vc_info.xlsx")
```

### 输出到数据库

采用 psycopg 连接到 PostgreSQL 数据库，将信息视图存储到数据库中。

```python
import psycopg

# 数据库连接信息
db_name = "db_name"
db_user = "db_user"
db_pass = "db_pass"
db_host = "db_host"
db_port = "db_port"

# 数据库连接字符串
conn_info = f"dbname={db_name} user={db_user} password={db_pass} host={db_host} port={db_port}"

# 插入数据库表中
with psycopg.connect(conn_info) as conn:
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO db.table_name
            VALUES
            (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (row["name"], row["ip"], row["vc_ip"], row["power_state"], \
                row["cpu_num"], row["memory"], row["disk_size"], row["from_host"], \
                row["from_host_name"], row["from_cluster"], row["from_lun"]))
```
