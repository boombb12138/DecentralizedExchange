import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../../constants/ICOindex";
import styles from "./Home.module.css";
import { Canvas } from "@react-three/fiber";

import MyEthCoin from "../MyEthCoin.js";

export default function Home() {
  // 创建一个BigNumber 0
  const zero = BigNumber.from(0);
  // 跟踪用户钱包是否连接
  const [walletConnected, setWalletConnected] = useState(false);
  // loading
  const [loading, setLoading] = useState(false);
  // 跟踪可以被claimed的token数量
  // 基于用户持有的NFT 看哪个NFT他们还没有claimed为token,检查用户可以claim的token
  // tokensToBeClaimed被初始化为a Big Number
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);

  // 跟踪一个地址拥有的token数量
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoTokens] = useState(zero);
  // 用户想要mint的token数量
  const [tokenAmount, setTokenAmount] = useState(zero);
  // 已经被mint的token总数
  const [tokensMinted, setTokensMinted] = useState(zero);
  // 通过地址得到合约的拥有者
  const [isOwner, setIsOwner] = useState(false);
  // 创建web3modal的引用
  const web3ModalRef = useRef();

  // 检查用户可以claim的token
  const getTokensToBeClaimed = async () => {
    try {
      // 从web3Modal中拿到provider
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);
      if (balance === zero) {
        setTokensToBeClaimed(zero);
      } else {
        var amount = 0; //amount存储还没有被claimed的token数量
        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }

        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (err) {
      console.error(err);
      setTokensToBeClaimed(zero);
    }
  };

  // 检查一个地址拥有的token余额
  const getBalanceOfCryptoDevTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress(); //得到目前连接钱包的地址
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfCryptoTokens(balance);
    } catch (err) {
      console.error(err);
      setBalanceOfCryptoTokens(zero);
    }
  };

  // mint amount数量的token给一个给定的地址
  const mintCryptoDevToken = async (amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      // 1token=0.001 ether 所以我们要发送 0.001 *amount的ether
      const value = 0.001 * amount;
      const tx = await tokenContract.mint(amount, {
        // 我们使用来自ethers的 utils 库将 '0.001' 字符串解析为ether
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);

      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully minted Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

  const claimCryptoDevTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully claimed Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
      // 用户索取token成功后 要调用getBalanceOfCryptoDevTokens函数，增加用户地址拥有的token余额
      // 减少用户可以索取的token
    } catch (err) {
      console.error(err);
    }
  };

  // 有多少token已经被mint了
  const getTotalTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    } catch (err) {
      console.error(err);
    }
  };

  // 通过连接地址得到合约拥有者
  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const _owner = await tokenContract.owner();
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // 提取ether和代币
  const withdrawCoins = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.withdraw();
      setLoading(true);
      await tx.wait(true);
      setLoading(false);
      // await getOwner(); //todo 为什么在提取完代币后，要得到owner呢
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    // 连接Metamask
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    //todo  有了节点之后创建一个web3Provider的节点？ 这个可能要看web3Modal的文档

    // 如果用户没有连接Goerli测试网 提示切换
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      // todo 这个可能要看web3Modal的文档
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfCryptoDevTokens();
      getTokensToBeClaimed();
      withdrawCoins();
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>loading</button>
        </div>
      );
    }

    // 如果owner连接了，就调用提币
    if (walletConnected && isOwner) {
      return (
        <div>
          <button className={styles.button1} onClick={withdrawCoins}>
            withdraw Coins
          </button>
        </div>
      );
    }

    // 如果有可以索要的代币，就返回一个索要按钮
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    //如果用户没有可以claim的token 就展示mint按钮
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          ></input>
        </div>

        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintCryptoDevToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp"></meta>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                You have minted {utils.formatEther(balanceOfCryptoDevTokens)}
                Crypto Dev Tokens
              </div>
              <div className={styles.description}>
                {/* tokensMinted是一個BigNumebr  formatEther將BigNumebr轉爲string*/}
                Overall {utils.formatEther(tokensMinted)}/10000 have been
                minted!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>

        <Canvas
          style={{
            opacity: 0.3,
            position: "absolute",
            right: 0,
          }}
        >
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <MyEthCoin />
        </Canvas>
      </div>

      <footer className={styles.footer}>Made with &#10084; by Naomi</footer>
    </div>
  );
}
