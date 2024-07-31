---
author: lkw123
pubDatetime: 2024-03-05T10:00:00+08:00
modDatetime: 2024-07-30
title: 我的 MacOS 开发环境配置
slug: macos-dev-setup
featured: true
draft: false
tags:
  - MacOS
description: Some of my personal MacOS dev environment configurations
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

## 常用软件安装

![fastfetch](@assets/images/fastfetch-screenshot.webp)

### 命令行工具

统一采用 Homebrew 对系统软件包进行管理，安装命令行工具时，优先考虑 Homebrew 提供的软件包。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

差生文具多：

|                          Prefer                           |                                          Description                                          | Replace  |
| :-------------------------------------------------------: | :-------------------------------------------------------------------------------------------: | :------: |
|        [eza](https://github.com/eza-community/eza)        |                           A modern, maintained replacement for ls.                            |    ls    |
|      [zoxide](https://github.com/ajeetdsouza/zoxide)      |                       A smarter cd command, supports all major shells.                        |    cd    |
|         [htop](https://github.com/htop-dev/htop)          |                                An interactive process viewer.                                 |   top    |
|     [ripgrep](https://github.com/BurntSushi/ripgrep)      | ripgrep recursively searches directories for a regex pattern while respecting your gitignore. |   grep   |
|            [ncdu](https://dev.yorhel.nl/ncdu)             |         Ncdu (NCurses Disk Usage) is a disk usage analyzer with an ncurses interface.         |    du    |
|           [bat](https://github.com/sharkdp/bat)           |                                  A cat(1) clone with wings.                                   |   cat    |
|            [fd](https://github.com/sharkdp/fd)            |                    A simple, fast and user-friendly alternative to 'find'.                    |   find   |
|         [procs](https://github.com/dalance/procs)         |                         A modern replacement for ps written in Rust.                          |    ps    |
|          [fzf](https://github.com/junegunn/fzf)           |                  A general-purpose command-line fuzzy finder written in Go.                   |   find   |
|       [fzf-tab](https://github.com/Aloxaf/fzf-tab)        |                   Replace zsh's default completion selection menu with fzf.                   |   find   |
|       [tokei](https://github.com/XAMPPRocky/tokei)        |                      A program that displays statistics about your code.                      |   cloc   |
|                  [tldr](https://tldr.sh)                  |                        Collaborative cheatsheets for console commands.                        |   man    |
|        [thefuck](https://github.com/nvbn/thefuck)         |                 Magnificent app which corrects your previous console command.                 |    -     |
|    [lazygit](https://github.com/jesseduffield/lazygit)    |                            A simple terminal UI for git commands.                             |   git    |
| [lazydocker](https://github.com/jesseduffield/lazydocker) |                   A simple terminal UI for both docker and docker-compose.                    |  docker  |
|  [fastfetch](https://github.com/fastfetch-cli/fastfetch)  |                  Like neofetch, but much faster because written mostly in C.                  | neofetch |
|       [delta](https://github.com/dandavison/delta)        |                  A syntax-highlighting pager for git, diff, and grep output.                  |   diff   |

### 终端利器 Fzf

在日常的 shell 环境中，可以通过 Fzf + Ripgrep + Bat + Vim 来提升效率，方便地管理文件及其内容。

* 文件查询:
  
  调用 Fzf 进行文件查找，并使用 Bat 在右侧窗口预览选中文件的前 500 行内容。可以通过 Shift+Up 和 Shift+Down 翻页，快速浏览文件内容。

  ```shell
  alias pf='fzf --preview='\''bat --color=always --style=header,grid --line-range \
        :500 {}'\'' --bind shift-up:preview-page-up,shift-down:preview-page-down'
  ```

  如下图所示：

  ![](@assets/images/pf_screenshot.webp)

* 内容查询:
  
  使用 Ripgrep 搜索文件内容，并结合 Fzf 进行模糊匹配搜索。搜索结果将实时展示在 Fzf 窗口中，并通过 Bat 预览文件的相关内容。绑定按键 Enter 键和 Ctrl+O 键以实现在 Vim 中打开搜索结果，进行进一步的编辑。

  ```shell
  rfv() (
    RELOAD='reload:rg --column --color=always --smart-case {q} || :'
    OPENER='if [[ $FZF_SELECT_COUNT -eq 0 ]]; then
              vim {1} +{2}     # No selection. Open the current line in Vim.
            else
              vim +cw -q {+f}  # Build quickfix list for the selected items.
            fi'
    fzf --disabled --ansi --multi \
        --bind "start:$RELOAD" --bind "change:$RELOAD" \
        --bind "enter:become:$OPENER" \
        --bind "ctrl-o:execute:$OPENER" \
        --delimiter : \
        --preview 'bat --style=header,grid --color=always --line-range :500 --highlight-line {2} {1} \
        --preview-window '~4,+{2}+4/3,<80(up)' \
        --query "$*"
  )
  ```

  如下图所示：

  ![](@assets/images/rfv_screenshot.webp)

可以将以上内容添加至 `~/.zshrc` 文件中，从而构建一个更加高效的命令行 Workflow。

### Zsh 配置

常用的 [Oh My Zsh](https://ohmyz.sh/) 对于我来说略显臃肿，因此我选择使用 [zinit](https://github.com/zdharma-continuum/zinit) 来管理插件。

至此，`~/.zshrc` 可以分为几个模块，分别定义不同的功能配置：

#### zinit 相关

在安装 zinit 的过程中，它会自动的接管 `~/.zshrc`，并向其中添加其相关配置如下：

```bash
### Added by Zinit's installer
if [[ ! -f $HOME/.local/share/zinit/zinit.git/zinit.zsh ]]; then
    print -P "%F{33} %F{220}Installing %F{33}ZDHARMA-CONTINUUM%F{220} Initiative Plugin Manager (%F{33}zdharma-continuum/zinit%F{220})…%f"
    command mkdir -p "$HOME/.local/share/zinit" && command chmod g-rwX "$HOME/.local/share/zinit"
    command git clone https://github.com/zdharma-continuum/zinit "$HOME/.local/share/zinit/zinit.git" && \
        print -P "%F{33} %F{34}Installation successful.%f%b" || \
        print -P "%F{160} The clone has failed.%f%b"
fi

source "$HOME/.local/share/zinit/zinit.git/zinit.zsh"
autoload -Uz _zinit
(( ${+_comps} )) && _comps[zinit]=_zinit

# Load a few important annexes, without Turbo
# (this is currently required for annexes)
zinit light-mode for \
    zdharma-continuum/zinit-annex-as-monitor \
    zdharma-continuum/zinit-annex-bin-gem-node \
    zdharma-continuum/zinit-annex-patch-dl \
    zdharma-continuum/zinit-annex-rust

### End of Zinit's installer chunk
```

#### 加载环境变量

```bash
# Load Environment Variables
export PATH="/Users/lkw123/Library/Python/3.9/bin:$HOME/.cargo/bin:$PATH"
export BAT_THEME="Monokai Extended Origin"
export STARSHIP_CONFIG="/Users/lkw123/.config/starship/starship.toml"
export GPG_TTY=$(tty)
```

#### 三个基础插件

- [zdharma/fast-syntax-highlighting](https://github.com/zdharma-continuum/fast-syntax-highlighting): 语法高亮，与 `zsh-syntax-highlighting` 功能几乎一致，个人使用习惯更偏向于 f-sy-h。
- [zsh-users/zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions): 自动补全，根据历史命令自动补全。
- [zsh-users/zsh-completions](https://github.com/zsh-users/zsh-completions): 补全插件，提供了常用命令的补全。

```bash
# Add in zsh plugins
zinit light zdharma-continuum/fast-syntax-highlighting
zinit light zsh-users/zsh-completions
zinit light zsh-users/zsh-autosuggestions

# Load completions
autoload -Uz compinit && compinit

# Completion styling
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'
zstyle ':completion:*' list-colors "${(s.:.)LS_COLORS}"
zstyle ':completion:*' menu no
```

#### 引入 fzf-tab

值得注意的一点是，根据 [fzf-tab](https://github.com/Aloxaf/fzf-tab) 的 README 中的 [compatibility-with-other-plugins](https://github.com/Aloxaf/fzf-tab#compatibility-with-other-plugins) 所言，需要将 fzf-tab 的引入放在配置文件的最后部分，以避免和 zsh-completions 插件产生冲突。

```bash
# fzf-tab init and styling
zinit light Aloxaf/fzf-tab
zstyle ':fzf-tab:complete:cd:*' fzf-preview 'eza --icons -1 --color=always $realpath'
zstyle ':fzf-tab:complete:__zoxide_z:*' fzf-preview 'eza --icons -1 --color=always $realpath'
zstyle ':fzf-tab:complete:z:*' fzf-preview 'eza --icons -1 --color=always $realpath'
```

通过以上的配置，可以实现在 cd 目录时，配合 fzf 的功能快速预览目标目录的文件结构：

![](@assets/images/fzf-tab-screenshot.jpg)

#### 定义别名

```bash
# Aliases
alias ls="eza"
alias ll="eza --time-style=default --icons --git -l"
alias la="eza --time-style=long-iso --icons --group --git --binary -la"
alias tree="eza --tree --icons"
alias cls="clear"
alias cat="bat"
alias v="nvim"
```

![](@assets/images/shell-screenshot.jpg)

#### 历史记录

```bash
# History
HISTSIZE=5000
HISTFILE=~/.zsh_history
SAVEHIST=$HISTSIZE
HISTDUP=erase
setopt appendhistory
setopt hist_ignore_space
setopt hist_ignore_all_dups
setopt hist_save_no_dups
setopt hist_ignore_dups
setopt hist_find_no_dups
```

#### Shell 集成

- [starship](https://starship.rs/)：基于 Rust 的跨平台的 Shell 提示符，具有轻量、迅速、客制化的特点，选用 [Tokyo Night](https://starship.rs/presets/tokyo-night) Preset；
- [thefuck](https://github.com/nvbn/thefuck)：用于快速更改输错的命令，实际使用中比较鸡肋，使用场景没有预想的多；
- [zoxide](https://github.com/ajeetdsouza/zoxide)：用于快速跳转常用的工作目录；
- [fnm](https://github.com/Schniz/fnm)：Node.js 版本管理工具。

```bash
# Shell integrations
eval "$(starship init zsh)"
eval "$(thefuck --alias)"
eval "$(fzf --zsh)"
eval "$(zoxide init zsh)"
eval "$(fnm env --use-on-cd)"
```

最后，简单测试一下 Zsh 的启动时间：

1. 采用直观的比较 Naive 的方式直接观测 zsh 的启动速度：

   ```bash
   ❯ for i in $(seq 10); do
     /usr/bin/time zsh -lic exit
   done

       0.16 real         0.10 user         0.04 sys
       0.13 real         0.09 user         0.03 sys
       0.13 real         0.09 user         0.03 sys
       0.13 real         0.09 user         0.03 sys
       0.13 real         0.09 user         0.03 sys
       0.14 real         0.10 user         0.03 sys
       0.14 real         0.09 user         0.03 sys
       0.13 real         0.09 user         0.03 sys
       0.13 real         0.09 user         0.03 sys
       0.13 real         0.09 user         0.03 sys
   ```

2. 借助 [zsh-bench](https://github.com/romkatv/zsh-bench) 更完善的对 zsh 的启动时间进行基准测试：
   ```bash
   ❯ ./zsh-bench
   ==> benchmarking login shell of user lkw123 ...
   creates_tty=0
   has_compsys=1
   has_syntax_highlighting=1
   has_autosuggestions=1
   has_git_prompt=1
   first_prompt_lag_ms=199.405
   first_command_lag_ms=202.526
   command_lag_ms=59.470
   input_lag_ms=4.480
   exit_time_ms=136.965
   ```

确实挺不错的 :)

### 开发工具

- [Warp](https://www.warp.dev/)：一个由 Rust 编写的跨平台终端，性能优秀，同时还有 AI 加持；
- [VS Code](https://code.visualstudio.com/)：常用的轻量级代码编辑器，部分推荐插件如下：
  - [Live Server](https://github.com/ritwickdey/vscode-live-server/)
  - [Github Copilot Chat](https://docs.github.com/en/copilot/github-copilot-chat/using-github-copilot-chat-in-your-ide)
  - [Gitlens](https://www.gitkraken.com/gitlens)
  - [koroFileHeader](https://github.com/OBKoro1/koro1FileHeader)
- [Zed Editor](https://zed.dev/)：采用 Rust 构建，性能强大速度快，支持 [Copilot](https://zed.dev/blog/copilot) 和实时协作等，目前作为主力编辑器使用；

### GUI 工具

统一采用 Homebrew Cask 进行管理。

```text
$ brew list
==> Formulae
...
==> Casks
1password                       iina                    plex
alacritty                       jellyfin                sabnzbd
applite                         loop                    transmit
daisydisk                       lulu                    tuxera-ntfs
downie                          netnewswire             typora
font-jetbrains-mono-nerd-font   notion                  zed
font-lxgw-wenkai                orbstack
handbrake                       pictureview
```

### 开发环境

- Python: [uv](https://github.com/astral-sh/uv) -> An extremely fast Python package installer and resolver, written in Rust
- Node: [fnm](https://github.com/Schniz/fnm) -> Fast and simple Node.js version manager, built in Rust
- Java: [jenv](https://github.com/linux-china/jenv) -> Java enVironment Manager
- Go: [gvm](https://github.com/moovweb/gvm) -> Go Version Manager
- Rust: [rustup](https://rustup.rs/) -> The Rust toolchain installer

### Tmux 配置

感谢 B 站 UP 主帕特里柯基在视频 [和我一起配置 tmux](https://www.bilibili.com/video/BV12y421h7rH/) 中分享的配置过程。我的 Tmux 配置基本是照搬过来：

```bash
# List of plugins
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'christoomey/vim-tmux-navigator'
set -g @plugin 'tmux-plugins/tmux-yank'

# catppuccin theme
set -g @plugin "catppuccin/tmux"
set -g @catppuccin_flavour "mocha"

# Initialize TMUX plugin manager (keep this line at the very bottom of tmux.conf)
run '~/.tmux/plugins/tpm/tpm'

# non-plugin options
set -g default-terminal "tmux-256color"
set -g base-index 1
set -g pane-base-index 1
set -g renumber-windows on
set -g mouse on

# visual mode
set-window-option -g mode-keys vi
bind-key -T copy-mode-vi v send-keys -X begin-selection
bind-key -T copy-mode-vi C-v send-keys -X rectangle-toggle
bind-key -T copy-mode-vi y send-keys -X copy-selection-and-cancel

# keymaps
unbind C-b
set -g prefix C-Space
```

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

![](@assets/images/mac-upgrade.jpg)

可以作为定时任务，周期性执行，以保持 Mac 上软件为最新版本。

---

我的部分 dotfiles 托管于 GitHub 仓库 [synthpop123/dotfiles](https://github.com/synthpop123/dotfiles)，仅用于备份用途。
