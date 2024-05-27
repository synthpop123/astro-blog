---
author: lkw123
pubDatetime: 2021-05-07T10:00:00.000Z
title: 摊还分析 Amortized Analysis
slug: amortized-analysis
featured: false
tags:
  - Algorithm
description: "Introduction to Amortized Analysis: a method for analyzing the average time of all operations in a sequence"
---

摊还分析是一种分析一个操作序列中所执行的所有操作的平均时间分析方法。与一般的平均分析方法不同的是，**它不涉及概率的分析，可以保证最坏情况下每个操作的平均性能**。

下面以带有额外 MULTIPOP 操作的栈的实例为例，分别对摊还分析中最常用的三种技术进行介绍。最后定义一种特殊的操作序列，并通过以上三种方法对其摊还代价进行分析。

## Table of contents

## 聚合分析 Aggregate Analysis

### 概念与定义

证明对所有 $n$，一个 $n$ 个操作的序列最坏情况下花费的总时间为 $T(n)$。因此，在最坏情况下，每个操作的平均代价（或摊还代价）为 $T(n)/n$。

此摊还代价适用于序列中的每个操作（即使操作类型不同也是如此）。

考虑栈操作，我们熟知的基本栈操作：

- `PUSH(S, x)`：将对象 x 压入栈 S 中，时间 $O(1)$；
- `POP(S)`：将栈 S 的栈顶对象弹出，并返回该对象，时间 $O(1)$。

在此基础上，增加一个新的栈操作 MULTIPOP，时间 $O(min(s, k))$。

```cpp
MULTIPOP(S, k)
1  while not STACK-EMPTY(S) and k > 0
2     POP(S)
3     k = k - 1
```

### 基本分析

问题：以一个由 n 个 PUSH、POP、MULTIPOP 操作的序列作用于一个空栈 S，总运行时间？

- 每个操作都可能是 MULTIPOP；
- 每个 MULTIPOP 的运行时间是 $O(\min(k, s)=O(n)$；
- 总的运行时间的上界为 $O(n^2)$。

虽然这个分析是正确的，但我们通过单独分析每个操作的最坏情况得到的总最坏情况时间 $O(n^2)$ 并不是一个确界。

考察出现这种情况的原因，我们发现：**这 3 种操作不是平行的，而是互相影响的**。换言之，只有我们每次通过 PUSH 创造 “机会” 给 POP 和 MULTIPOP，POP 和MULTIPOP 才能 “消费” 这些机会，而不存在无限制的消费。

### 通过聚合分析确定摊还代价

原理：**将一个对象压入栈后，我们至多将其弹出一次**。

因此，对一个非空的栈，可以执行的 POP 操作的次数(包括了 MULTIPOP 中调用 POP 的次数)最多与 PUSH 操作的次数相当，即最多 n 次。

对任意的 n 值，任意一个由 n 个 PUSH、POP 和 MULTIPOP 组成的操作序列，最多花费 $O(n)$ 时间。故一个操作的平均时间为 $O(n)/n=O(1)$。

## 核算法 Accounting Method

### 概念与定义

对不同操作赋予不同费用，赋予某些操作的费用可能多于或少于其实际代价。

我们将赋予一个操作的费用称为它的**摊还代价**。当一个操作的摊还代价超出其实际代价时，我们将差额存入数据结构中的特定对象，存入的差额称为**信用**。

注意，数据结构中存储的信用永远为**非负值**。否则对于到此时为止的操作序列，总摊还代价不再是总实际代价的上界。

### 通过核算法确定摊还代价

$$
\begin{array}{|c | c |c |}\hline
     \textbf{ 操作 } & \textbf{ 实际代价 } & \textbf{ 摊还代价 } \\\hline
     \text{PUSH} & \mathbf{1} & \mathbf{2} \\\hline
     \text{POP} & \mathbf{1} & \mathbf{0} \\\hline
     \text{MULTIPOP} & \min (\boldsymbol{k}, \boldsymbol{s}) & \mathbf{0} \\\hline
\end{array}
$$

对 PUSH 操作赋予代价 2 元：**1 元支付压栈操作的实际代价，剩余的 1 元存为信用**。

当执行一个 POP/MULTIPOP 操作时，不再多缴纳费用，而是从存储的信用取出 1 元/ k 元来支付其实际代价。

## 势能法 Potential Method

### 概念与定义

并不将预付代价表示为数据结构中特定对象的信用，而是表示为 “势能”，或简称 “势”，**将势能释放即可用来支付未来操作的代价**。

不需要管关心存储多少信用，而是只需要证明，每个操作积累的势能是常数的，别的操作只是消费势能就好了。

势能法工作方式如下。我们将对一个初始数据结构 $D_{0}$ 执行 $n$ 个操作。对每个 $i=1,2, \cdots,n$，令 $c_{i}$ 为第 i 个操作的实际代价，令 $D_{i}$ 为在数据结构 $D_{i-1}$ 上执行第 i 个操作得到的结果数据结构。

**势函数** $\Phi$ 将每个数据结构 $D_{i}$ 映射到一个实数 $\Phi\left(D_{i}\right)$，此值即为关联到数据结构 $D_{i}$ 的势。

第 i 个操作的**摊还代价** $\hat{c}_{i}$ 用势函数 $\Phi$ 定义为：

$$
\hat c_{i}=c_{i}+\Phi(D_{i})- \Phi(D_{i-1})
$$

因此，每个操作的摊还代价等于其实际代价加上此操作引起的势能变化。则 n 个操作的总摊还代价为

$$
\begin{aligned}
\sum_{i=1}^{n} \hat c_{i} &= \sum_{i=1}^{n}\left(c_{i} + \Phi\left(D_{i}\right)- \Phi\left(D_{i-1}\right)\right) \\\ &= \sum_{i=1}^{n} c_{i} + \Phi\left(D_{n}\right)- \Phi\left(D_{0}\right)
\end{aligned}
$$

### 通过势能法确定摊还代价

将一个栈的势函数定义为其中的对象数量。

- 对初始空栈 $D_0$，令 $\Phi(D_0)＝0$
- 由于栈中对象数目非负，则有 $\Phi(D_i) \geqslant 0 = \Phi(D_0)$

因此用 $\Phi$ 定义的 n 个操作的**总摊还代价即为实际代价的一个上界**。

下面计算不同栈操作的摊还代价。如果第 i 个操作是 PUSH 操作，此时栈中包含 s 个对象，则势差为

$$
\Phi\left(D_{i}\right)-\Phi\left(D_{i-1}\right)=(s+1)-s=1
$$

则由题意，PUSH 操作的摊还代价为

$$
\hat c_{i}=c_{i}+\Phi\left(D_{i}\right)-\Phi\left(D_{i-1}\right)=1+1=2
$$

假设第 i 个操作是 `MULTIPOP(S, k)`，将 $k^{\prime}=\min (k, s)$ 个对象弹出栈。对象的实际代价为 $k^{\prime}$，势差为

$$
\Phi\left(D_{i}\right)-\Phi\left(D_{i-1}\right)=-k^{\prime}
$$

因此，MULTIPOP 的摊还代价为

$$
\hat c_{i}=c_{i}+\Phi\left(D_{i}\right)-\Phi\left(D_{i-1}\right)=k^{\prime}-k^{\prime}=0
$$

类似地，普通 POP 操作的推还代价也为 0。每个操作的摊还代价都是 $O(1)$，因此，n 个操作的总摊还代价为 $O(n)$。由于我们已经论证了 $\Phi\left(D_{i}\right) \geqslant \Phi\left(D_{0}\right)$，因此 n 个操作的总推还代价为总实际代价的上界，所以 n 个操作的最坏情况时间为 $O(n)$。

## 实例分析

假定我们对一个数据结构执行一个由 n 个操作组成的序列，当 i 严格为 2 的幂时，第 i 个操作的代价为 i，否则代价为 1。

### Exercise 1 (CLRS 17.1-3)

> 使用聚合分析确定每个操作的摊还代价。

**Solution**: Let $n$ be arbitrary, and have the cost of operation $i$ be $c(i)$. Then we have,

$$
\begin{aligned}
\sum_{i = 1}^n c(i) & = \sum_{i = 1}^{\left\lceil\lg n\right\rceil} 2^i + \sum_{i \leqslant n \text{ is not a power of } 2} 1 \\\ & \leqslant \sum_{i = 1}^{\left\lceil\lg n\right\rceil} 2^i + n \\\ & = 2^{1 + \left\lceil\lg n\right\rceil} - 1 + n \\\ & \leqslant 2n - 1 + n \\\ & \leqslant 3n \in O(n).
\end{aligned}
$$

To find the average, we divide by $n$, and the amortized cost per operation is $O(1)$.

### Exercise 2 (CLRS 17.2-2)

> 使用核算法确定每个操作的摊还代价。

**Solution**: Let $c_i =$ cost of $i\th$ operation.

$$
 c_i = \begin{cases} i & \text{if $i$ is an exact power of $2$}, \\\ 1 & \text{otherwise}. \end{cases}
$$

Charge $3$ (amortized cost $\hat c_i$) for each operation.

- If $i$ is not an exact power of 2, pay $1$, and store $2$ as credit.
- If $i$ is an exact power of 2, pay $i$, using stored credit.

$$
\begin{array}{cccc} \textbf{Operation} & \textbf{Cost} & \textbf{Actual cost} & \textbf{Credit remaining} \\ \hline 1 & 3 & 1 & 2 \\\ 2 & 3 & 2 & 3 \\\ 3 & 3 & 1 & 5 \\\ 4 & 3 & 4 & 4 \\\ 5 & 3 & 1 & 6 \\\ 6 & 3 & 1 & 8 \\\ 7 & 3 & 1 & 10 \\\ 8 & 3 & 8 & 5 \\\ 9 & 3 & 1 & 7 \\\ 10 & 3 & 1 & 9 \\\ \vdots & \vdots & \vdots & \vdots \end{array}
$$

Since the amortized cost is $3$ per operation, $\sum\limits_{i = 1}^n \hat c_i = 3n$.

We know from Exercise 1 that $\sum\limits_{i = 1}^n \hat c_i < 3n$.

Then we have

$$
\sum_{i = 1}^n \hat c_i \geqslant \sum_{i = 1}^n c_i \Rightarrow \text{credit} = \text{amortized cost} - \text{actual cost} \geqslant 0.
$$

Since the amortized cost of each operation is $O(1)$, and the amount of credit never goes negative, the total cost of $n$ operations is $O(n)$.

### Exercise 3 (CLRS 17.3-2)

> 使用**势能法**确定每个操作的摊还代价。

**Solution**: Define the potential function $\Phi(D_0) = 0$, and $\Phi(D_i) = 2i - 2^{1 + \lfloor \lg i \rfloor}$ for $i > 0$. For operation 1,

$$
\begin{aligned}\hat c_i &= c_i + \Phi(D_i) - \Phi(D_{i - 1}) \\\ &= 1 + 2i - 2^{1+ \lfloor \lg i \rfloor} - 0 \\\ &= 1.\end{aligned}
$$

For operation $i(i > 1)$, if $i$ is not a power of 2, then

$$
\begin{aligned}
\hat c_i &= c_i + \Phi(D_i) - \Phi(D_{i - 1}) \\\ &= 1 + 2i - 2^{1 + \lfloor \lg 1 \rfloor} - (2(i - 1) - 2^{1 + \lfloor \lg(i - 1) \rfloor})\\\ &= 3.
\end{aligned}
$$

If $i = 2^j$ for some $j \in \mathbb N$, then

$$
\begin{aligned}
\hat c_i &= c_i + \Phi(D_i) - \Phi(D_{i - 1}) \\\ & = i + 2i - 2^{1 + j}-(2(i - 1) - 2^{1 + j - 1}) \\\ &= i + 2i - 2i - 2i + 2 + i \\\ &= 2.
\end{aligned}
$$

Thus, the amortized cost is 3 per operation.
