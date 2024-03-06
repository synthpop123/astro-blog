---
author: lkw123
pubDatetime: 2024-02-20T10:00:00Z
title: Rust 学习笔记（一）
slug: rust-notes-1
featured: false
draft: false
tags:
  - Rust
description: "Learning Rust: Basic ideas, installation, and crates.io mirror"
---

## Table of contents

## Rust 安装

对于 MacOS 用户，可以通过 [Homebrew](https://brew.sh/) 一键安装 Rust 环境：

测试是否安装成功：

```bash
$ rustc --version
rustc 1.75.0 (82e1608df 2023-12-21) (Homebrew)

$ cargo --version
cargo 1.75.0
```

## [crates.io](https://crates.io/) 换源

由于国内拉取 crates.io 以及安装 Rust 会面临流量出境不稳定的问题，我们往往需要配置一个国内镜像代理。

> 自 Cargo 1.68 版本起，支持**稀疏索引** (Sparse Index)：不再需要完整克隆 crates.io-index 仓库，从而可以加快获取包的速度。

以字节跳动提供的的 Cargo 公益镜像源 [rsproxy](https://rsproxy.cn/) 为例，更改配置文件 `$HOME/.cargo/config.toml` 如下：

```toml
[source.crates-io]
replace-with = 'rsproxy-sparse'
[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"
[source.rsproxy-sparse]
registry = "sparse+https://rsproxy.cn/index/"
[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"
[net]
git-fetch-with-cli = true
```

除此之外，可通过一个简单的 Rust 命令行工具 [**crm** (Cargo registry manager)](https://github.com/wtklbm/crm/)，便捷的实现 Cargo 镜像源的更换和管理：

通过 Cargo 安装：

```bash
cargo install crm
```

使用方法：

```
crm best                    评估网络延迟并自动切换到最优的镜像
  crm best git              仅评估 git 镜像源
  crm best sparse           仅评估支持 sparse 协议的镜像源
  crm best git-download     仅评估能够快速下载软件包的 git 镜像源 (推荐使用)
  crm best sparse-download  仅评估能够快速下载软件包且支持 sparse 协议的镜像源 (推荐使用)
crm current                 获取当前所使用的镜像
crm default                 恢复为官方默认镜像
crm install [args]          使用官方镜像执行 "cargo install"
crm list                    从镜像配置文件中获取镜像列表
crm publish [args]          使用官方镜像执行 "cargo publish"
crm remove <name>           在镜像配置文件中删除镜像
crm save <name> <addr> <dl> 在镜像配置文件中添加/更新镜像
crm test [name]             下载测试包以评估网络延迟
crm update [args]           使用官方镜像执行 "cargo update"
crm use <name>              切换为要使用的镜像
crm version                 查看当前版本
crm check-update            检测版本更新
```
