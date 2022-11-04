import { Contract, utils } from "ethers";

import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

// addLiquidity给交易所添加流动性 如果用户正在添加初始化流动性，用户决定他想要添加的eth或CD Token
// 如果他在初始化流动性之后添加流动性 我们根据他要添加的eth计算他能加的CD Token 来维持流动性
export const addLiquidity = async (
  signer,
  addCDAmountWei,
  addEtherAmountWei
) => {
  try {
    // 创建token合约实例
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      signer
    );
    // 创建exchange合约实例
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      signer
    );
    //因为CD Token是ERC20代币，用户需要给合约授权一定数量的token
    let tx = await tokenContract.approve(
      EXCHANGE_CONTRACT_ADDRESS,
      addCDAmountWei.toString()
    );
    await tx.wait();
    // 合约被授权之后，往流动性池中添加eth和CD Token
    tx = await exchangeContract.addLiquidity(addCDAmountWei, {
      value: addEtherAmountWei,
    });
    await tx.wait();
  } catch (err) {
    console.error(err);
  }
};

// calculateCD计算在给定_addEtherAmountWei数量的eth的情况下 有多少CD Token需要被添加到流动性池
export const calculateCD = async (
  _addEther = "0",
  etherBalanceContract,
  cdTokenReserve
) => {
  // _addEther是一个字符串，我们需要通过ethers里面的parseEther将他转为Bignumber
  const _addEtherAmountWei = utils.parseEther(_addEther);

  // 需要维持比率 以免价格大波动
  // 对于给定的eth数量可以添加多少token
  // todo 这里为什么可以调用mul div
  const cryptoDevTokenAmount = _addEtherAmountWei
    .mul(cdTokenReserve)
    .div(etherBalanceContract);
  return cryptoDevTokenAmount;
};
