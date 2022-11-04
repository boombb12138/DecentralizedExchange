import { Contract, providers, utils, BigNumber } from "ethers";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS } from "../constants";

// 从流动性中移除' removeLPTokensWei '数量的LP Token
// 并计算eth和CD代币的量
export const removeLiquidity = async (signer, removeLPTokensWei) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  );
  const tx = await exchangeContract.removeLiquidity(removeLPTokensWei);
  const { ethAmount, cryptoDevTokenAmount } =
    await exchangeContract.removeLiquidity(removeLPTokensWei);
  await tx.wait();
  return {
    ethAmount,
    cryptoDevTokenAmount,
  };
};

// 计算eth和CD代币的数量 eth和CD代币会在用户移除removeLPTokenWei数量的LP Token之后返回给用户
export const getTokensAfterRemove = async (
  provider,
  removeLPTokensWei,
  _ethBalance,
  cryptoDevTokenReserve
) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );
    // 得到CD LP Token的总数
    const _totalSupply = await exchangeContract.totalSupply();
    // 这里我们使用的是乘法和除法的BigNumber方法
    const _removeEther = _ethBalance.mul(removeLPTokensWei).div(_totalSupply);
    const _removeCD = cryptoDevTokenReserve
      .mul(removeLPTokensWei)
      .div(_totalSupply);
    return {
      _removeEther,
      _removeCD,
    };
    //用户remove LP Token后，返回给用户的Eth数量
  } catch (err) {
    console.error(err);
  }
};
