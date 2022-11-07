import { Contract } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

// 当用户交换' _swapAmountWei '数量的Eth/Crypto Dev令牌时
// 将有多少Crypto Dev令牌/Eth的数量返回给用户
export const getAmountOfTokensReceivedFromSwap = async (
  _swapAmountWei,
  provider,
  ethSelected,
  ethBalance,
  reservedCD
) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    provider
  );
  let amountOfTokens;

  //If `Eth` is selected this means our input value is `Eth` which means our input amount would be
  // `_swapAmountWei`, the input reserve would be the `ethBalance` of the contract and output reserve
  // would be the `Crypto Dev` token reserve
  //   如果eth被选中了，那么input reserve=ethBalance  output reserve=`Crypto Dev` token reserve
  if (ethSelected) {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      ethBalance,
      reservedCD
    );
  } else {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      reservedCD,
      ethBalance
    );
  }
  return amountOfTokens;
};

//用`swapAmountWei`的Eth/Crypto Dev tokens 换 `tokenToBeReceivedAfterSwap` amount of Eth/Crypto Dev tokens.
export const swapTokens = async (
  signer,
  swapAmountWei,
  tokenToBeReceivedAfterSwap,
  ethSelected
) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  );
  const tokenContract = new Contract(
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    signer
  );
  let tx;
  //   If Eth is selected call the `ethToCryptoDevToken` function else
  // call the `cryptoDevTokenToEth` function from the contract
  // As you can see you need to pass the `swapAmount` as a value to the function because
  // it is the ether we are paying to the contract, instead of a value we are passing to the function
  // 如果Eth被选中，则调用' ethToCryptoDevToken '函数else
  //从合约中调用' cryptoDevTokenToEth '函数
  //你可以看到，你需要传递' swapAmount '作为一个值给函数，因为
  //它是我们支付给合约的eth，而不是我们传递给函数的值
  if (ethSelected) {
    // todo 这里的参数为什么传入了tokenToBeReceivedAfterSwap
    tx = await exchangeContract.ethToCryptoDevToken(
      tokenToBeReceivedAfterSwap,
      {
        value: swapAmountWei,
      }
    );
  } else {
    // 用户给合约授权swapAmountWei的CD Token
    tx = await tokenContract.approve(
      EXCHANGE_CONTRACT_ADDRESS,
      swapAmountWei.toString()
    );
    await tx.wait();
    // call cryptoDevTokenToEth function which would 接收`swapAmountWei` of `Crypto Dev` tokens and would
    //返回 `tokenToBeReceivedAfterSwap` amount of `Eth`给用户
    //    todo 这里的参数为什么传入了tokenToBeReceivedAfterSwap
    // 看看前端怎么调用的 将要接收的eth数量
    tx = await exchangeContract.cryptoDevTokenToEth(
      swapAmountWei,
      tokenToBeReceivedAfterSwap
    );
    await tx.wait();
  }
};
