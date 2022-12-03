<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
### Decentralized Exchange on Goerli

### Summarize

DEX is divided into 2 parts: front-end and contract

The functions of DEX are as follows:

- Anyone can add liquidity to become a liquidity provider
- Liquidity providers can withdraw their liquidity and get their cryptocurrency back at any time
- Users can exchange between assets in the trading pool, provided there is sufficient liquidity
- Users are charged a small transaction fee, which is split among liquidity providers so that they can earn money by providing liquidity

### Overview

This exchange contains only one trading pair, namely ETH and Krypto Devtoken

##### The smart contract mainly implements 3 functions

1. When adding liquidity:

- If there is no asset in the pool and the initial value of the two tokens is 0, then accept any eth or Crypto Devtoken provided by the user and give the user LP tokens
- If there are assets in the pool, receive the eth provided by the user, and determine how much Crypto Devtoken the user needs to provide to the contract according to the ratio, and give the user LP tokens

2. When removing liquidity:

![公式](https://user-images.githubusercontent.com/95857565/205418962-0765c63a-168b-4ea3-9c6a-aa8eda1c3c63.png)
![公式2](https://user-images.githubusercontent.com/95857565/205418965-9d8cf598-9307-43bf-b79f-bc599d434872.png)



3. exchange

##### The front end mainly uses React, Three.js

### Require

1. VSCode or other IDE
2. React
3. next
4. web3modal
5. three


================================================================
### 建造一个类似于Uniswap的去中心化交易所😀  

这个repo里包含了Uniswap的原理图，我整合了知乎上的一篇文章（链接在导图里面有）和LW3的教程，做了总结性的思维导图 :wink:


### 总结

DEX分为2部分：前端和合约

DEX的功能如下：

- 任何人都可以添加流动性以成为流动性提供者
- 流动性提供者可以随时移除他们的流动性并取回他们的加密货币
- 用户可以在交易池中的资产之间进行交换，前提是有足够的流动性
- 用户被收取少量交易费用，这些费用在流动性提供商之间分配，以便他们可以通过提供流动性来赚钱

### 概述

这个交易所只包含一个交易对，即ETH和rypto Devtoken

##### 智能合约主要实现了3个功能

1. 添加流动性时：

- 如果池内没有资产，2种代币初始值都是0，那么接受任何用户提供的eth或Crypto Devtoken，并给用户LP代币
- 如果池内有资产，接收用户提供的eth,并根据比例确定用户需要提供多少Crypto Devtoken给合约，并给用户LP代币

2. 移除流动性时：

![公式](https://user-images.githubusercontent.com/95857565/205418962-0765c63a-168b-4ea3-9c6a-aa8eda1c3c63.png)
![公式2](https://user-images.githubusercontent.com/95857565/205418965-9d8cf598-9307-43bf-b79f-bc599d434872.png)




3. 交换

##### 前端主要使用了React，Three.js

### 要求

1. VSCode或其他IDE
2. React
3. next
4. web3modal
5. three



话不多说 上图:tanabata_tree:

Uniswap的原理图

![Uniswap](https://user-images.githubusercontent.com/95857565/199932271-f2d40efa-f766-4b9b-9380-fbbccfa9eb21.png)


项目框架

![DEX去中心化交易所](https://user-images.githubusercontent.com/95857565/199932288-e4d75f4e-b702-4e51-80d8-665ea05b6b58.png)

