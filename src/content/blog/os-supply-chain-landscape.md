---
author: lkw123
pubDatetime: 2023-06-16T01:00:00+08:00
title: 操作系统软件供应链构建与风险追踪
slug: os-supply-chain-landscape
featured: false
draft: false
tags:
  - Linux
  - Security
  - Supply Chain
  - Visualization
description: Operating system software supply chain landscape and vulnerability tracking
---

## Table of contents

上篇[博文](https://blog.lkwplus.com/software-dependencies-parser)实现了对操作系统软件包内外部依赖项的精准解析，我们可以将其作为数据基础，构建完整的操作系统软件供应链。我们以 **Ubuntu 22.04** 作为实例分析，从软件供应链结构分析和软件供应链风险追踪两个维度开展讨论，并对实验结果进行总结。

## 软件供应链结构分析

### 实现

为剖析软件供应链的基本结构特征，我们需要完成构建操作系统软件供应链，并对其进行**可视化**，利用图的相关性质进行分析。

在构建软件供应链的过程中，采用朴素的思想，操作系统提供的每个软件包代表一个节点，而若软件包 A 依赖于软件包 B，则添加一条由 A 指向 B 的有向边。考虑案例对象 Ubuntu，本文处理方式如下：

- 依赖类型：根据 Debian 的[规定](https://www.debian.org/doc/debian-policy/ch-relationships.html)，软件包中间依赖关系分为 Depends、Pre-Depends、Build-Depends等六种，当依赖关系为 Depends 或 Pre-Depends 时，添加相应依赖关系，权重相同，其余情形忽略；
- 未知包：若被列为依赖关系的软件包，其在软件包数据库中是未知的，则将其忽略；
- 虚包：虚包与其它软件包置为同一权重，若只有一个包提供虚包，则将这个包和该虚包之间的依赖关系添加至图中；如果有多个包提供虚包，则将这组包都加入该虚包的依赖关系中；
- 包版本：如果一个软件包有多个版本，将使用最高的可用版本的依赖信息；
- 重复包：通过遍历软件包列表，在特定的发行版中，包名存在重复的情形只有一种，即**包自身也同时作为虚包被提供**（如 acedb-other-belvu 等）。对于此类情形，本文对于重复包名视为同一节点，添加相应依赖关系。

本文对构建的 Ubuntu 软件依赖图数据进行整理，并借助工具 Gephi 实现 Ubuntu 的软件依赖图的绘制，绘制过程如下，得到的软件供应链全景图如下图所示。

- 采用 **[Force Atlas 2](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0098679)** 图布局算法。为了避免孤岛节点过于分散，激活更强的重力，并将重力设置为 0.05；
- 根据模块性聚类算法检测到的聚类为每个节点上色，以直观体现整个网络的聚类分布；
- 将节点大小设置为入度的函数，以突出关键节点，直观地展示节点的相对重要性。在一定范围内，节点的入度越大，节点越大。

![Ubuntu 22.04 操作系统软件供应链全景图](@assets/images/dep.jpg)

### 结论

#### 模块度分析

本文采用 Vincent 等人提出的 Louvain 算法对图数据进行分析，计算模块度时对网络进行了随机化操作，并将用于控制聚类的紧密程度的分辨率参数设置为 1.0，Modularity 分布图如下图所示，分析结果如下：

- Modularity（模块度）：模块度是一种衡量网络分区质量的指标，值介于 -1 到 1 之间，较高的模块度值表示网络中存在着明显的模块化结构。模块度为 0.736，这表明网络中存在较强的模块化模式。
- Number of Communities（社区数量）：社区是具有高内部连接且相对较少连接到其他社区的节点集合。根据聚类分析，网络被分为 4837 个社区。

![modularity-report.png](@assets/images/modularity-report.png)

根据计算，Ubuntu 的软件包依赖网络显示出较高的模块度值 (0.736)，这表明网络中存在着明显的模块化结构。而网络被分为 4837 个社区，平均每个社区中包含 21.4 个节点，这些社区具有较强的内部连通性，并且与其它社区之间的连接较少。

#### 节点关系分析

依赖图的每个节点与 Ubuntu 22.04 中的软件包一一对应，节点在图中的属性反映**软件包在操作系统供应链中的特性**，边在图中的性质则对应**软件包间的依赖关系**。对特定的节点而言，本文基于其基本性质从入度、祖先节点数、可达节点数三个角度进行分析。

**节点的入度**代表着对应的软件包被其它软件包直接依赖的次数，入度最大的十个节点如下表所示。这些作为直接依赖较多的软件包具有一些共同的特点和功能。它们大多提供了操作系统和应用程序开发所需的基础功能和支持，例如，libc6 提供了 C 语言标准库函数，libstdc++6 提供了 C++ 标准库函数，它们为开发者提供了编程语言和编译器所需的核心功能。同时，一些软件包则是运行时支持库，为其它程序提供必要的运行时环境和函数。例如，libglib2.0-0、libgmp10 和 libqt5core5a 等库提供了运行时所需的数据结构、算法和功能，以便其他应用程序能够正常运行。

$$
\begin{array}{cc}
\hline
\textbf{Name} & \textbf{Amount} \\
\hline
    \text{libc6} & 23174 \\
    \text{libstdc++6} & 7433 \\
    \text{libgcc-s1} & 6539 \\
    \text{python3} & 6095 \\
    \text{perl} & 5040 \\
    \text{libglib2.0-0} & 3046 \\
    \text{zlib1g} & 2937 \\
    \text{ghc} & 2275 \\
    \text{libgmp10} & 2179 \\
    \text{libqt5core5a} & 1930 \\
\end{array}
$$

**节点的祖先节点数**代表着对应的软件包被其它软件包直接或间接依赖的次数，祖先节点数最多的十个节点如下表所示。通览这部分软件包，它们和作为直接依赖较多的软件包之间具有一定的相似性，却也存在一些差别。在提供操作系统所需的核心功能的同时，更注重基础功能。例如 libzstd1、liblzma5 和 libbz2-1.0 与数据压缩和解压缩相关，它们用于处理各种压缩格式，又如 libpcre2-8-0 是 PCRE2 库的特定版本，用于处理与匹配文本中的正则表达式。这部分软件包尽管作为直接依赖较少，但由于提供较底层的基础功能，被大量作为高级软件包的间接依赖项。

$$
\begin{array}{cc}
\hline
\textbf{Name} & \textbf{Amount} \\
\hline
\text{gcc-12-base} & 74508 \\
    \text{libc6} & 74498 \\
    \text{libcrypt1} & 74498 \\
    \text{libgcc-s1} & 74498 \\
    \text{zlib1g} & 63653 \\
    \text{libzstd1} & 58259 \\
    \text{liblzma5} & 57965 \\
    \text{libpcre2-8-0} & 57394 \\
    \text{libselinux1} & 57353 \\
    \text{libbz2-1.0} & 56511 \\
\end{array}
$$

**节点的可达节点数**代表着对应的软件包的直接或间接依赖项的总和，可达节点数最多的十个节点如下表所示。直观而言，软件包的依赖项越多，其功能与具体实现越复杂。而这十个软件包均与 Ubuntu 桌面环境相关。它们是 Ubuntu 桌面的不同变体或组件，用于提供图形用户界面 (GUI) 和基本桌面功能。桌面环境提供了丰富的功能扩展和可交互功能，且需要使用大量的图形库来渲染和显示图形元素，因此，软件包需要大量的直接或间接依赖，在依赖图中体现为可达节点数目众多。

$$
\begin{array}{cc}
\hline
\textbf{Name} & \textbf{Indegree} \\
\hline
\text{task-cinnamon-desktop} & 2498 \\
\text{cinnamon-desktop-environment} & 2475 \\
\text{gnome} & 2317 \\
\text{task-gnome-desktop} & 2196 \\
\text{vanilla-gnome-desktop} & 2168 \\
\text{gnome-core} & 2154 \\
\text{ubuntu-gnome-desktop} & 2121 \\
\text{packagekit-installer} & 2121 \\
\text{ubuntu-desktop} & 2120 \\
\text{ubuntu-desktop-minimal} & 2119 \\
\end{array}
$$

#### 聚类分析

本文对依赖图中得到的所有聚类进行统计，以聚类中包含的节点数目作为参考值，顺次选取节点数目较多的四个聚类，对聚类分布情况呈现为下图：

![](@assets/images/cluster-percent.jpg)

在根据模块度所划分的 4837 个聚类中，节点数最多的四个聚类占所有节点的 39.9%，可以看出**少量的核心的**操作系统基础软件包在依赖链中具有**不可替代的重要作用**。对这四个主要聚类进行考察，按照节点数递减的顺序：

- Cluster A，包含 12763 个节点，**中心节点为 libghc**。这部分软件包由 Haskell 语言编写，依赖于 GHC (Glasgow Haskell Compiler) 编译器的库 libghc，它们作为一个整体构成了 Haskell 编程语言的生态系统，可以通过 GHC 编译器和 Haskell 的软件包管理平台 Hackage 进行安装和管理。
- Cluster B，包含 10455 个节点，**中心节点为 libc6 和 libc++6**。这部分软件包中需要使用 C 和 C++ 编程语言，依赖于标准库 libc6 和 libc++6 来提供基本的函数和数据结构支持。聚类中的所有软件包形成一个整体，是 C 和 C++ 编程语言的生态系统的关键组成部分。
- Cluster C，包含 9714 个节点，整体连通性不强，**没有突出的中心节点**。通过提取部分关键节点进行分析，如 libgdk-pixbuf-2.0-0 用于加载和处理图像数据，libpango 则用于文本布局和渲染，这部分软件包整体实现了 Ubuntu 复杂的桌面环境功能。
- Cluster D，包含 8378 个节点，**中心节点为 librust-serde-dev**。librust-serde-dev 用于在 Rust 项目中引入和使用 Serde 库，这部分软件包大多数采用 Rust 语言编写，常用于数据交换和持久化，是 Rust 编程语言的生态系统的关键组成部分。

从整体到局部，依赖图中染为紫色的聚类即为节点数最多的 Cluster A，通过直观分析，可以很明显的看出其呈现为上下两个层状结构，如下图所示。通过对各层包含的软件包的功能进行分析，上层软件包（如 libghc-vector-dev 等）多为运行时库或基础开发包，在操作系统的核心运转中提供更底层、更基础的功能，下层软件包（如 ghc-prof 等）则主要实现进行错误处理、优化等进阶功能，与实际应用更相关。

![libghc-cluster.jpg](@assets/images/libghc-cluster.jpg)

总的来说，操作系统作为一种具备复杂功能的软件系统，实质上是由多种各司其职的**功能集**组合而成。功能集依赖于与其对应的基础软件包，内部相对独立，围绕核心基础软件包形成**局部软件供应链**。而不同的功能集之间相互关联，彼此存在相互依赖的关系，同时，一些基础包可能会被多个功能集反复依赖，从而形成**整体的复杂的操作系统软件供应链**。在依赖图中，聚类即是功能集的直观展现，每个功能集各自依赖的基础包则反映为对应聚类的中心节点。

## 软件供应链风险追踪

### 实现

为了更好地识别和了解开源软件中的漏洞信息，Google 开发并维护了名为 **[OSV](https://osv.dev/)** (Open Source Vulnerabilities) 的开源漏洞数据库。OSV 致力于收集和提供有关开源软件漏洞的信息，为开发者和安全研究人员提供支持，它具有信息覆盖广泛、持续更新等诸多优点，本文基于该数据库挖掘供应链中的依赖风险。

本文借助 **[OSV-Scanner](https://google.github.io/osv-scanner/)** 对操作系统软件包的源码进行风险扫描，挖掘其中的供应链风险以帮助开发者和安全研究人员及时了解操作系统中存在的潜在漏洞，并采取适当的措施来保护系统安全。在默认情况下，OSV-Scanner 会以绘制表格的形式在命令行输出扫描漏洞的结果，本文将 Ubuntu 22.04 中的依赖风险扫描结果以 JSON 格式进行存储，便于后续处理。

$$
\begin{array}{cccccc}
\textbf{OSV ID} & \textbf{ECOSYSTEM} & \textbf{PKG} & \textbf{VERSION} & \textbf{SOURCE} \\
\hline
\texttt{GHSA-55x5-fj6c-h6m8} & \text{PyPI} & \text{lxml} & \text{4.6.2} & \text{\textasciitilde/requirements.txt} \\
\texttt{GHSA-jq4v-f5q6-mjqq} & \text{PyPI} & \text{lxml} & \text{4.6.2} & \text{\textasciitilde/requirements.txt} \\
\texttt{PYSEC-2021-19} & & & & \\
\texttt{GHSA-wrxv-2j5q-m38w} & \text{PyPI} & \text{lxml} & \text{4.6.2} & \text{\textasciitilde/requirements.txt} \\
\texttt{PYSEC-2022-230} & & & & \\
\end{array}
$$

以软件包 afdko-3.6.2+dfsg1 为例，风险扫描结果如上表所示，其依赖风险均来源于 requirements.txt 文件中声明的依赖项 “lxml==4.6.2”，尽管这些风险都在 lxml 4.6.3 中得到了及时的修复，然而由于**软件包的依赖声明文件未及时更新**，在安装该软件包时仍会引入安全风险。

### 结论

$$
\begin{array}{ccc}
\textbf{OSV ID} & \textbf{Packages Influenced} & \textbf{Fixed Date} \\
\hline
\text{GHSA-f8q6-p94x-37v3} & \text{460} & \text{2023-01-23} \\
\text{GHSA-xvch-5gv4-984h} & \text{446} & \text{2023-02-27} \\
\text{GHSA-93q8-gq69-wqmw} & \text{356} & \text{2022-08-10} \\
\text{GHSA-29mw-wpgm-hmr9} & \text{336} & \text{2022-02-08} \\
\text{GHSA-35jh-r3h4-6jhm} & \text{336} & \text{2022-02-08} \\
\text{GHSA-hj48-42vr-x3v9} & \text{313} & \text{2021-08-10} \\
\text{GHSA-p6mc-m468-83gw} & \text{293} & \text{2022-02-08} \\
\text{GHSA-vh95-rmgr-6w4m} & \text{272} & \text{2022-04-26} \\
\text{GHSA-ww39-953v-wcq6} & \text{265} & \text{2022-08-02} \\
\text{GHSA-hrpp-h998-j3pp} & \text{260} & \text{2023-01-18} \\
\end{array}
$$

通过对 72350 个 Ubuntu 软件包的源码进行安全扫描，本文发现其中的 1079 个软件包在依赖关系中存在引入安全漏洞的风险，所有供应链风险共计 40969 条。对于出现次数最多的十个漏洞列举如上表所示，这部分出现较多的漏洞在本文撰写时均已被修复。并对软件包的依赖风险进行计数，可得到软件包依赖漏洞数目分布图，大多数软件包中包含的依赖风险在 100 处以内，极少数软件包的依赖风险多于 200 处。

![vulnerabilities-amount.png](@assets/images/vulnerabilities-amount.png)

从漏洞被修复日期的角度来看，以在 2021 年 8 月即被修复的漏洞 GHSA-hj48-42vr-x3v9 为例，在已被修复近两年后，其仍对 313 个软件包造成影响，这些软件包的依赖声明文件没有及时更新，主要分为三类情形：

- 软件包自漏洞修复后**并未有新的 commit**。这意味着软件包的维护者没有对漏洞进行修复或者没有及时提交修复的代码，这种情况可能是由于维护者的疏忽或者其他原因导致的。
- 软件包自漏洞修复后**有新的 commit，但并未修复依赖漏洞**。如软件包 node-balanced-match，其在 2021 年 10 月提交的 [commit](https://git.launchpad.net/ubuntu/+source/node-balanced-match/commit/?id=16ece72c07ff1f3024884e41a6a9ba870d49ae48) 中忽略该依赖漏洞。这表明软件包的维护者虽然对软件包本身的漏洞进行了修复，但对其依赖项漏洞没有进行修复。
- 软件包自漏洞修复后在新的 commit 中已修复依赖漏洞，但 **patch 尚未被应用到主代码库中**。如软件包 mediawiki-skin-greystuff，其在 2022 年 9 月提交的 [commit](https://git.launchpad.net/ubuntu/+source/mediawiki-skin-greystuff/commit/?id=e9bab7bee5cc0b04cf7f677ddc8d4caf5b7422e9) 中更改了依赖声明以修复安全风险，但该 patch 并未同步至主代码库 ubuntu/jammy。

可以看出，目前在软件包维护和依赖管理方面仍存在一些不足。这需要在软件包维护过程中加强监查措施，确保漏洞修复的及时性和依赖项的安全性。同时，开发者和维护者应该密切关注漏洞修复的通知，并确保更新和修复被正确地应用到软件包中。然而，新漏洞的出现和旧漏洞的修复接连不断，仅靠人工很难维持漏洞修复的即时性。在这种情况下，开发者应当推进研究沿操作系统软件供应链的依赖安全风险自动化追踪工具，通过软件供应链及时的完成下游代码的依赖项更改，并自动化代码审查、解决合并冲突等工作，最大限度地保障操作系统软件生态的整体安全性。
