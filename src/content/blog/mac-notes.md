---
author: lkw123
pubDatetime: 2024-03-05T10:00:00Z
title: Mac 使用小记
slug: mac-notes
featured: false
draft: false
tags:
  - MacOS
description: All the stuffs I ran into when using MacOS
---

## Table of contents

## 系统设置

程序坞自动隐藏加速

```bash
# 设置启动坞动画时间设置为 0.5 秒
defaults write com.apple.dock autohide-time-modifier -float 0.5 && killall Dock

# 设置启动坞响应时间最短
defaults write com.apple.dock autohide-delay -int 0 && killall Dock

# 恢复启动坞默认动画时间
defaults delete com.apple.dock autohide-time-modifier && killall Dock

# 恢复默认启动坞响应时间
defaults delete com.apple.Dock autohide-delay && killall Dock
```

启动台自定义行和列

```bash
# 设置列数
defaults write com.apple.dock springboard-columns -int 7

# 设置行数
defaults write com.apple.dock springboard-rows -int 6

# 重启 Dock 生效
killall Dock

# 恢复默认的列数和行数
defaults write com.apple.dock springboard-rows Default
defaults write com.apple.dock springboard-columns Default

# 重启 Dock 生效
killall Dock
```

解除 `history` 输出条数过少的限制

```bash
export HISTSIZE=100000
export HISTFILESIZE=100000
```

## 常用软件安装

### 命令行工具

统一采用 Homebrew 对系统软件包进行管理，安装命令行工具时，优先考虑 Homebrew 提供的软件包。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

- [eza](https://github.com/eza-community/eza)：用于替代 `ls`，`eza` 是已停止维护的 [exa](https://github.com/ogham/exa) 的一个分支，功能更为丰富，开源社区更活跃；
- [neofetch](https://github.com/dylanaraps/neofetch)：以美观方式展示系统详细信息；
- [Oh My Zsh](https://ohmyz.sh/)：一个开源的、社区驱动的框架，用于管理 zsh 配置，安装如下插件：
  - [zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions)
  - [zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting)
- [htop](https://github.com/htop-dev/htop) 等。

### 开发工具

- [Warp](https://www.warp.dev/)：一个由 Rust 编写的跨平台终端，性能优秀，同时还有 AI 加持；
- [VS Code](https://code.visualstudio.com/)：常用的轻量级代码编辑器，部分推荐插件如下：
  - [Live Server](https://github.com/ritwickdey/vscode-live-server/)
  - [Github Copilot Chat](https://docs.github.com/en/copilot/github-copilot-chat/using-github-copilot-chat-in-your-ide)
  - [Gitlens](https://www.gitkraken.com/gitlens)
  - [koroFileHeader](https://github.com/OBKoro1/koro1FileHeader)
- [Zed Editor](https://zed.dev/)：采用 Rust 构建，性能强大速度快，支持 [Copilot](https://zed.dev/blog/copilot) 和实时协作等，目前作为主力编辑器使用；

## MacOS 软件一键更新

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
