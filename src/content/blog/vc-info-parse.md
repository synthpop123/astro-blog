---
author: lkw123
pubDatetime: 2024-01-10T10:00:00Z
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

##

### 基本方法

在初始化与 vCenter 的连接的过程中，需要注意的一点是，自 PyVmomi v8.0 起，`connect.ConnectNoSSL()` and `connect.SmartConnectNoSSL()` 方法已被[移除](https://github.com/vmware/pyvmomi/releases/tag/v8.0.0.1)，解决方式是在常规的连接方法中增加 `disableSslCertValidation=True` 选项。

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

### 获取虚拟机信息

### 获取集群信息

### 获取数据存储信息

## 数据展示

### 输出到控制台

### 输出到表格文件

### 输出到数据库
