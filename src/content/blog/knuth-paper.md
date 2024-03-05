---
author: lkw123
pubDatetime: 2021-05-18
title: 论文阅读 Mathematical Analysis of Algorithms
slug: knuth-paper
featured: true
ogImage: https://user-images.githubusercontent.com/53733092/215771435-25408246-2309-4f8b-a781-1f3d93bdf0ec.png
tags:
  - Algorithm
  - Math
  - Paper
description: "Reading notes on 「Mathematical Analysis of Algorithms」 by Donald Knuth"
---

## Table of contents

> “Mathematical Analysis of Algorithms” 由著名的计算机科学家 Donald Knuth 于 1971 年发表。

这篇文章主要引入两个具体的算法问题来展现算法效率分析的典型方法。

- **Rearranging data without using auxiliary memory space**. 不使用额外的存储空间的排序算法（原地排序）。
- **Finding the element of rank *t* when *n* elements are ranked by some linear ordering relation**. 在线性有序表中查找特定值。

## **Introduction**

算法分析领域的核心目标是研究如何量化分析各个不同算法的好坏，主要的两类问题如下：

1. **Analysis of a particular algorithm**. 分析某些特定算法的基本特征。
   - Frequency analysis. 分析算法的各部分的执行次数情况，实际上是分析时间复杂度。
   - Storage analysis. 分析算法占用的内存资源情况，实际上是分析空间复杂度。
2. **Analysis of a class of algorithms**. 分析解决一类问题的所有算法，尝试找到最优的算法。本文指出这类问题的两点弊端：
   - **对技术性调整敏感**。某些微小改变可能对最优算法的选取产生巨大的影响，因此研究往往被局限在一个有限范围内；
   - **难以控制模型的拟合性**。第 2 类问题的分析往往过于复杂，而简化模型可能与现实相悖，导致算法分析出现失误。

正因此，尽管第 1 类问题没有第 2 类问题有趣，但在实际应用中也可以发挥出巨大作用。在接下来的核心篇幅中，Knuth 便借助两个实例来具体阐述算法分析的基本思路。

---

## **In Situ Permutation**

### 问题提出

给定一个一维数组 $x_1,x_2,\cdots,x_n$，以及一个函数 $p$，使得 $p(1),p(2),\cdots,p(n)$ 是对 $1,2,\cdots,n$ 的一个排列，同时 $x_{p(1)},x_{p(2)},\cdots,x_{p(n)}$ 有序。附加要求如下：

1. 算法的空间复杂度为 $O(1)$；
2. 不能修改存储排列 $p(1),p(2),\cdots,p(n)$ 的空间。

### 算法设计

由数学知识，我们认识到这样的事实：在任意一个排列 $p(1),p(2),\cdots,p(n)$，我们总会存在若干个“**环**”，这个环形如 $p(i_1)=i_2,p(i_2)=i_3,…,p(i_k)=i_1$。

以如下排列 $p$ 为例：

$$
\begin{array}{|c | c| c| c| c | c| c| c| c|c |}\hline
     \textbf{i } & \textbf{1} & \textbf{2}&\textbf{3} &\textbf{4} & \textbf{5} &\textbf{6} &\textbf{7} &\textbf{8} &\textbf{9} \\\hline
     \text{p(i)}& \text{8}           & \text{2} & \text{7}& \text{1}& \text{6}& \text{9}& \text{3}& \text{4}& \text{5}\\\hline
\end{array}
$$

我们可以发现这个排列中有四个“环”：

$$
\begin{cases}
\begin{aligned}
p(1)&=8, p(8)=4, p(4)=1 \\\ p(2)&=2 \\\ p(3)&=7, p(7)=3 \\\ p(5)&=6, p(6)=9, p(9)=5
\end{aligned}
\end{cases}
$$

我们定义某一环中最小的值为这个环的头元素，那么每当我们发现了一个环的头元素 $k$，我们便将 $x_{p(k)}$ 的值填入 $x_k$ 处，将 $x_{p(p(k))}$ 的值填入 $x_{p(k)}$ 处……最终将 $x_k$ 填入环的尾元素对应的位置即可。

```python
for j = 1 to n
   # 从 p(j) 开始遍历这个环
   k = p(j)
   # 如果 j 不是环的头元素，那么就会存在一个环上点 k < j
   while k > j: # --> a
      k = p(k)
   if k == j: # --> b
      # k 是环的头元素
      y = x[j], l = p(k)
      while l != j:
         x[k] = x[l], k = l, l = p(k)
      x[k] = y
```

### 算法分析

由**基尔霍夫定律**，我们了解到所有进入某节点的电流的总和等于所有离开这节点的电流的总和，在这里，我们可以有效的衡量某部分程序的执行情况。具体地，判断 `k > j` 的总次数等于 `k = p(j)` 以及 `k = p(k)` 的执行次数之和。

为了便于分析，在伪代码注释中标记出两个部分 a 和 b。而对于算法的正确性分析，算法的设计过程已清晰的展现，而要给出一个严谨的证明则十分麻烦，作者在此选择略去繁琐的证明部分。

### 极端情况

若记当前环的长度为 n，易知当 $(p(1),p(2),\cdots,p(n))=(2,3,...,n,1)$ 时即对应 a 的最坏情况，此时 $a=(n-1)+(n-2)+\dots+0$ 取到最大值 $\frac{1}{2}(n^2-n)$，值得注意的是，此时正好对应着 b 的最好情况。

而相类似的，当 $(p(1),p(2),\cdots,p(n))=(1,2,3,...,n)$ 时即对应 b 的最坏情况，此时正好对应着 a 的最好情况。

### 平均情况

考虑 n 个元素的全排列的 $n!$ 种可能情况是等可能的，即对应着平均情况。

重新回顾此前的例子排列 $p$，可以这个排列的环表述为 $(1,8,4),(2),(3,7),(5,6,9)$，然而若不加限制，对其中每个环的表述方式会存在多种，难以统一，因此给予以下限制：

1. 每个环从其头元素开始；
2. 每个环的头元素递减排列。

在这样的条件下，环的表述可以固定为 $(5,6,9),(3,7),(2),(1,8,4)$。

而此时我们发现括号的存在已无实际意义，因此可以直接去掉。那么，我们可以将每一个 $(p(1),p(2),\cdots,p(n))$ 的排列映射为符合题意的 $(q(1),q(2),\cdots,q(n))$。

这时，我们可以对 b 的意义进行描述：$p$ 中的**环的个数**，也即 $q$ 中的 **“left-to-right minima”**（可以被表示为**第一类斯特林数**），由数学知识，记 b 的平均值为 $H_n$，b 的方差为 $H_n^{(2)}$，则有：

$$
H_{n}=1+\frac{1}{2}+\cdots+\frac{1}{n} \quad \text { and } \quad H_{n}^{(2)}=1+\frac{1}{4}+\cdots+\frac{1}{n^{2}}
$$

接下来我们同样可以对 a 的值进行分析。当循环变量 `j = q(i)` 时，_k_ 一直往后执行到 $q(i + r)$，满足 $q(i+r)<q(i)$ 抑或 $q(i)$ 为环的头元素，因此会从 $q(i)$ 到 $q(i + r)$ 执行运算，于是，令：

$$
y_{ij} = \begin{cases} 1, if\ q(i) < q(k)\ for\ i < k \leqslant j \\\ 0, \ otherwise \end {cases}
$$

那么

$$
a=\sum_{1 \leqslant i<j \leqslant n} y_{i j}
$$

具体地，在以上实例中，$(q(1),\cdots,q(9))=(5,6,9,3,7,2,1,8,4)$，此时代入公式可得$(i,j)=(1,2),(1,3),(2,3),(4,5),(7,8),(7,9)$ 时 $y_{ij}=1$，其余情形下 $y_{ij}=0$。

记 $y_{ij}$ 的平均值为 $\overline y_{ij}$，容易发现它便是所有 $n!$ 个排列中 $y_{ij}=1$ 的排列个数，我们有：

$$
\begin{aligned}
\overline a=\sum_{1 \leqslant i<j \leqslant n} \overline y_{i j} &=\sum_{1 \leqslant i<j \leqslant n} \frac{1}{j-i+1} \\\ &=\sum_{2 \leqslant r \leqslant n} \frac{n+1-r}{r}
\end{aligned}
$$

记调和级数为 $H_n$，对上式进行展开：

$$
\bar{a}=(n+1)\left(H_{n}-1\right)-(n-1)=(n+1) H_{n}-2 n
$$

由数学知识易证 $H_n=\sum\limits_{i=1}^n\frac{1}{i}=O(\log n)$，因此 a 的平均执行次数为 $O(\log n)$。

接下来我们对 a 的方差进行求解，我们需要计算下面式子的平均值：

$$
\begin{aligned}\left(\sum_{1 \leqslant i<j \leqslant n} y_{i j}\right)^{2}=&\sum_{1 \leqslant i<j \leqslant n} y_{i j}^{2}+\sum_{\substack{1 \leqslant i<j \leqslant n \\\ 1 \leqslant k<l \leqslant n \\\ (i, j) \neq(k, l)}} y_{i j} y_{k l} \\\ =&\sum_{1 \leqslant i<j \leqslant n} \overline y_{i j} +2 \sum_{1 \leqslant i<j<k<l \leqslant n}\left(y_{i j} y_{k l}+y_{i k} y_{j l}+y_{i l} y_{j k}\right) \\\ & +2 \sum_{1 \leqslant i<j<k \leqslant n}\left(y_{i j} y_{j k}+y_{i k} y_{j k}+y_{i j} y_{i k}\right) \\\ =& \overline a+2(A+B+C+D+E+F)\end{aligned}
$$

接下来便是一系列繁杂的数学运算过程：

$$
\begin{array}{ll}
B=\left(\begin{array}{l} n \\\ 2
\end{array}\right)-2 Z, & C=Y-Z-2\left(\begin{array}{l} n \\\ 2
\end{array}\right)+3 X \\\ D=E=Z-X, & F=\left(\begin{array}{l} n \\\ 2
\end{array}\right)-2 X
\end{array}
$$

其中，

$$
\begin{aligned}
X &=\sum_{1 \leqslant i<j \leqslant n} \frac{1}{j-i+1} \\\ Y &=\sum_{1 \leqslant i<j \leqslant n} H_{j-i} \\\ Z &=\sum_{1 \leqslant i<j \leqslant n} \frac{1}{j-i+1} H_{j-i}
\end{aligned}
$$

将 $r = j − i + 1$ 代入可得：

$$
\begin{aligned}
X&=(n+1) H_{n}-2 n \\\ Y&=\frac{1}{2}\left(n^{2}+n\right) H_{n}-\frac{3}{4} n^{2}-\frac{1}{4} n \\\ Z&=\frac{1}{2}(n+1)\left(H_{n}^{2}-H_{n}^{(2)}\right)-n H_{n}+n
\end{aligned}
$$

相对应地，

$$
\begin{aligned}
A &=\sum_{1 \leqslant i<j<k<l \leqslant n} \frac{1}{(j-i+1)(l-k+1)} \\\ &=\sum_{\substack{r \geqslant 2 \\\ s \geqslant 2 \\\ r+s \leqslant n}} \frac{1}{r s}\left(\begin{array}{c} n-r-s+2 \\\ 2
\end{array}\right)\\\ &=\sum_{\substack{2 \leqslant r \leqslant t-2 \\\ 4 \leqslant t \leqslant n}} \frac{1}{t}\left(\frac{1}{r}+\frac{1}{t-r}\right)\left(\begin{array}{c} n-t+2 \\\ 2
\end{array}\right)\\\ &=2 \sum_{\substack{2 \leqslant r \leqslant t-2 \\\ 4 \leqslant t \leqslant n}} \frac{1}{r t}\left(\begin{array}{c} n-t+2 \\\ 2
\end{array}\right) \\\ &=\sum_{\substack{2 \leqslant r \leqslant t-2 \\\ 4 \leqslant t \leqslant n}} \frac{1}{r t}\left((n+2)(n+1)-t(2 n+3)+t^{2}\right) \\\ &=(n+2)(n+1) U-(2 n+3) V+W
\end{aligned}
$$

令 $r=j-i+1,s=l-k+1,t=r+s$，代入可得：

$$
\begin{aligned}
U&=\frac{1}{2}\left(H_{n}-1\right)^{2}-\frac{1}{2} H_{n}^{(2)}+\frac{1}{n} \\\ V&=(n-1) H_{n-2}-2 n+4 \\\ W&=\frac{1}{2}\left(\left(n^{2}+n-2\right)\left(H_{n-2}-1\right)-\frac{1}{2}(n-1)(n-2)+1-3(n-3)\right)
\end{aligned}
$$

最终带入整理可以得到：

$$
\sigma^{2}=2 n^{2}-(n+1)^{2} H_{n}^{(2)}-(n+1) H_{n}+4 n
$$

对 a 的方差的讨论证明了 $O(n^2)$ 的最坏情况是非常罕见的。最后再进行一些近似，可以得到如下的结论：

$$
\begin{aligned}
a&=(\min 0, \text { ave } n \ln n+O(n), \max \frac{1}{2}(n^{2}-n),\text{dev} \sqrt{2-\pi^{2} / 6} n+O(\log n)) ; \\\ b&=(\min 1, \text { ave } \ln n+O(1), \max n, \text{dev} \sqrt{\ln n}+O(1))
\end{aligned}
$$

可以得出结论：**这个算法的平均时间复杂度为 $O(n\log  n)$，在极少数情况下可能达到 $O(n2)$**。

### 进一步分析

对于外循环遍历到的一个 $j$，同时搜索 $p(j), p^{-1}(j),p(p(j)),p^{-1}(p^{-1}(j)),\cdots$，其中 $p^{-1}$ 为 $p$ 的反函数，则可以对算法进行优化。

设最坏情况为 $f(n)$，此时整个排列只有一个长度为 n 的环，我们可以得到如下递推式：

$$
\begin{aligned}
f(1)&=0 \\\ f(n)&=\max _{1 \leqslant k<n}(\min (k, n-k)+f(k)+f(n-k))
\end{aligned}
$$

记 $\nu(k)$ 为 $k$ 的二进制表示中 1 的个数。对于这个看起来很难下手的问题，Knuth 给出了答案：

$$
f(n)=\sum_{0\leqslant k<n}\nu(k)
$$

若 $a_1>a_2>\cdots>a_r$，则有

$$
f(2^{a_1}+2^{a_2}+...+2^{a_r})=\frac{1}{2}(a_12^{a_1}+(a_2+2)2^{a_2}+...+(a_r+2r-2)2^{a_r})
$$

经过以上分析，我们了解到这种解法在最坏的情况下的时间复杂度为 $O(n\log n)$，实现了进一步的优化。

---

## Selecting the $t_{th}$ largest

### 问题提出

给定一个一维数组 $a_1,a_2,\cdots,a_n$，在比较次数尽可能少的前提下找到数组中第 _t_ 大的值。

### 算法设计

对于这种问题，一个时间复杂度为 $O(n\log n)$ 的排序算法便可以解决，因此，我们需要考虑的是有没有时间复杂度低于 $O(n\log n)$ 的算法。

回忆我们已了解的算法以及刚学过的分治策略，根据快速排序的启发，我们可以采取如下思路：

对于数组 $a_i,\cdots,a_j$，首先调用 `Partition()` 方法对 $a_i$ 的位置进行移动，记移动后的位置为 k，使它左边元素都比其小、右边元素都比其大。此时我们根据 k 和 t 的大小关系，就可以分别讨论接下来的搜索是在 k 的左侧还是右侧进行，抑或是此时 k 位置的元素正好是第 k 大的元素。

```python
FindtthNumber(a, i, j, t):
   key = a[i]
   # Partition()的实现参考快速排序的相关原理
   # Partition()返回的是分割后的数组下标
   # 减去数组开头的位置得到a[k]是a[i]-a[j]里第几大的数
   k = Partition(key, a, i, j) - i + 1
   if k == t:
      return a[k]
   else if k < t:
      return FindtthNumber(a, k + 1, j, t - k)
   else:
      return FindtthNumber(a, i, k - 1, t)
```

### 算法分析

对子问题的限定仅与两个变量有关：数组的长度 n 以及 所要找的数的位次 t，因此我们可以记子问题为 $C_{n,t}$，假设 t 的选取完全随机，那么

$$
\begin{aligned}C_{1,1}&=0 \\\ C_{n, t}&=n-1+\frac{1}{n}\left(A_{n, t}+B_{n, t}\right)\end{aligned}
$$

其中 $A_{n, t}$ 对应伪代码中 `k < t` 的情形：

$$
A_{n, t}=C_{n-1, t-1}+C_{n-2, t-2}+\cdots+C_{n-t+1,1}
$$

同时 $B_{n, t}$ 对应伪代码中 `k > t` 的情形：

$$
B_{n, t}=C_{t, t}+C_{t+1, t}+\cdots+C_{n-1, t}
$$

经过观察，我们发现

$$
A_{n+1,t+1} = A_{n,t}+C_{n,t}\\\ B_{n+1,t} = B_{n,t}+C_{n,t}
$$

使用差消迭代法，进行如下操作

$$
\begin{aligned}
&(n+1)C_{n+1,t+1}-nC_{n,t+1}-nC_{n,t}+(n-1)C_{n-1,t} \\\ =& (n+1)n - n(n-1) - n(n-1) + (n-1)(n-2) \\\ &+ A_{n+1,t+1}-A_{n,t+1}-A_{n,t}+A_{n-1,t} \\\ &+B_{n+1,t+1}-B_{n,t+1}-B_{n,t}+B_{n-1,t} \\\ =& 2 + C_{n,t} - C_{n-1,t}+C_{n,t+1}-C_{n-1,t}
\end{aligned}
$$

进而推出

$$
C_{n+1, t+1}-C_{n, t+1}-C_{n, t}+C_{n-1, t}=\frac{2}{n+1}\\\left(C_{n+1, t+1}-C_{n, t}\right)-\left(C_{n, t+1}-C_{n-1, t}\right)=\frac{2}{n+1}
$$

由此，

$$
\begin{aligned}
C_{n+1, t+1}-C_{n, t} &=\frac{2}{n+1}+\frac{2}{n}+\cdots+\frac{2}{t+2}+C_{t+1, t+1}-C_{t, t} \\\ &=2\left(H_{n+1}-H_{t+1}\right)+2-2 /(t+1)
\end{aligned}
$$

不断进行迭代可得

$$
C_{n, t}=2\left((n+1) H_{n}-(n+3-t) H_{n+1-t}-(t+2) H_{t}+n+3\right)
$$

由于调和级数 $H_n = O(\log n)$，我们可以得出结论：无论 n 和 t 取何值，算法的平均时间复杂度为 $C_{n,t}=O(n)$。

## Summary

对以上的两个算法实例进行解释分析只是作者用来解释算法分析的本质的一个途径，作者希望表明自己的以下观点：

- 算法分析对计算机科学领域十分重要，能够加深我们对计算机科学的理解；
- 算法分析与离散数学密切相关，许多技巧不在大学中讲授，但它们却是计算机科学家们的必修课；
- 算法分析正在形成科学方法，同时我们可以用一些比较通用的方法解决一系列问题；
- 算法分析领域还有很多问题等待着我们去解决。

参考资料：

["Mathematical Analysis of Algorithms" 阅读心得](https://hehao98.github.io/posts/2018/03/knuth-paper/)

[【翻译】Mathematical Analysis of Algorithms_erutan_pku的博客-CSDN博客](https://blog.csdn.net/erutan_pku/article/details/20291441)
