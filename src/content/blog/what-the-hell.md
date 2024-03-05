---
author: lkw123
pubDatetime: 2024-03-05T10:00:00Z
title: MacOS 软件一键更新
slug: mac-upgrade
featured: false
draft: false
tags:
  - MacOS
  - Homebrew
description: How to keep your mac software updated easily
---

### 准备工作

- 安装 [brew-cask-upgrade](https://github.com/buo/homebrew-cask-upgrade):
  ```bash
  brew tap buo/cask-upgrade
  ```
- 验证 `brew-cask-upgrade` 是否安装成功：
  ```bash
  brew tap | grep buo/cask-upgrade
  ```
- 安装 [mas](https://formulae.brew.sh/formula/mas)，一个用于管理 Mac App Store 上的应用的命令行工具：
  ```bash
  brew install mas
  ```

### 更新软件

升级所有已安装的软件：

```bash
brew update && brew upgrade && brew cu --all --yes --cleanup \
&& mas upgrade && brew cleanup
```

1. `brew update`：更新 Homebrew 自身及其相关软件源的信息，确保 Index 信息准确；

2. `brew upgrade`：将系统中已安装的所有 Homebrew 软件包升级到最新版本；

3. `brew cu --all --yes --cleanup`：自动升级所有可更新的 Homebrew cask 软件包到最新版本，并在完成后清理删除旧版本；

- _--all_: Include apps that auto-update in the upgrade.
- _--yes_: Update all outdated apps; answer yes to updating packages.
- _--cleanup_: Cleans up cached downloads and tracker symlinks after updating.

4. `mas upgrade`: 一键更新从 Mac App Store 安装的应用程序；

5. `brew cleanup`: 用于清理 Homebrew 安装的软件包时产生的临时文件和缓存，以释放磁盘空间。

执行结果样例如下：

![](@assets/images/mac-upgrade.png)

可以作为定时任务，周期性执行，以保持 Mac 上软件为最新版本。
