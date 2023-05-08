import { BigNumber, providers, utils } from "ethers";
import Head from "next/head";
import React, { Suspense, useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";

import { useSelector, useDispatch } from "react-redux";
import { OrbitControls as OrbitBackground } from "three/examples/jsm/controls/OrbitControls.js";
import TypeIt from "typeit-react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Sphere,
  MeshDistortMaterial,
  MeshStandardMaterial,
} from "@react-three/drei";
import { WagmiConfig, useAccount } from "wagmi";

import styles from "../styles/Home.module.css";
import { addLiquidity, calculateCD } from "../utils/addLiquidity";
import {
  getCDTokensBalance,
  getEtherBalance,
  getLPTokensBalance,
  getReserveOfCDTokens,
} from "../utils/getAmounts";
import {
  getTokensAfterRemove,
  removeLiquidity,
} from "../utils/removeLiquidity";
import { swapTokens, getAmountOfTokensReceivedFromSwap } from "../utils/swap";
import {
  AnimatedSphereBig,
  AnimatedSphereSmall,
  EarthSphere,
} from "../components/AnimatedSphere";
import AnimatedSphere from "../components/AnimatedSphere";

import Loading from "../components/Loading/Loading";
import Header from "../components/Header";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ConnectWalletButton } from "../components/ConnectWallet";
import { wagmiClient } from "../components/ConnectWallet";

export default function Home() {
  // =============================state variables ========================

  const [loading, setLoading] = useState(false);
  // Liquidity Tab and Swap Tab 有2种tabs 这个变量保存着用户在哪个tab 如果时true就说明用户在liquidity tab 不然就是再swap tab
  const [liquidityTab, setLiquidityTab] = useState(true);
  const zero = BigNumber.from(0);

  // 跟踪数量的变量

  // 用户拥有的eth数量
  const [ethBalance, setEtherBalance] = useState(zero);
  // 用户拥有的CD Token的数量
  const [cdBalance, setCDBalance] = useState(zero);
  // 用户拥有的LPToken的数量
  const [lpBalance, setLPBalance] = useState(zero);
  // exchange合约的Crypto Dev tokens的余额
  const [reservedCD, setReservedCD] = useState(zero);
  // 合约的eth余额
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);

  // 跟踪流动性被添加还是被移除

  // 用户想要添加到流动性池的eth数
  const [addEther, setAddEther] = useState(zero);
  // 用户想要添加到流动性池的CD Token的数量
  // 在没有初始流动性的情况下增加流动性后，它会根据eth的数量，计算用户可以添加的CD Token
  const [addCDTokens, setAddCDTokens] = useState(zero);
  //基于`LP` tokens的数量返回用户removeEther数量的 `Ether`
  const [removeEther, setRemoveEther] = useState(zero);
  // 基于用户想要提取的`LP` tokens的数量，返回用户removeCD数量的CD Token
  const [removeCD, setRemoveCD] = useState(zero);
  // 用户想要从流动性池中移除的LP Token的数量
  const [removeLPTokens, setRemoveLPTokens] = useState("0");

  // 跟踪swap函数

  // 用户想要交换的数量
  const [swapAmount, setSwapAmount] = useState("");
  // 交易结束后，用户会收到的token数量
  const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] =
    useState(zero);
  // 跟踪哪个token被选中
  // 如果eth被选中，说明用户想要用eth来换CD Token 反之亦然
  const [ethSelected, setEthSelected] = useState(true);

  // 连接钱包
  const web3ModalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);
  // const { address, isConnected, isDisconnected } = useAccount();
  // const walletConnected = isDisconnected;
  // const walletConnected = useSelector((state) => state.isConnected.value);

  // getamount调用各种函数来检索ethbalance ，LP令牌等，
  const getAmounts = async () => {
    try {
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      // 得到用户账户的eth余额
      const _ethBalance = await getEtherBalance(provider, address);
      // 用户持有的CD Token
      const _cdBalance = await getCDTokensBalance(provider, address);
      // 用户持有的CD LP Token
      const _lpBalance = await getLPTokensBalance(provider, address);
      // 获取exhcnage合约储备中存在的CD Token数量
      const _reservedCD = await getReserveOfCDTokens(provider);
      // 获取exhcnage合约储备的eth数量
      const _ethBalanceContract = await getEtherBalance(provider, null, true);
      setEtherBalance(_ethBalance);
      setCDBalance(_cdBalance);
      setLPBalance(_lpBalance);
      setReservedCD(_reservedCD);
      setReservedCD(_reservedCD);
      setEtherBalanceContract(_ethBalanceContract);
    } catch (err) {
      console.error(err);
    }
  };
  // =============================SWAP FUNCTIONS  ========================
  const _swapTokens = async () => {
    try {
      // 将用户输入的值通过ethers里的utils转为BigNumber
      const swapAmountWei = utils.parseEther(swapAmount);
      //检查用户是否输入了0 用到了ethers.js里面 BigNumber类的eq方法
      if (!swapAmountWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        // 从utils文件夹里调用swapTokens函数
        await swapTokens(
          signer,
          swapAmountWei,
          tokenToBeReceivedAfterSwap,
          ethSelected
        );
        setLoading(false);
        // 再交易后让所有都更新
        await getAmounts();
        setSwapAmount("");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setSwapAmount("");
    }
  };

  //返回 用户在swap之后可以接收到的token
  const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
    try {
      // 将用户输入的值通过ethers里的utils转为BigNumebr
      const _swapAmountWEI = utils.parseEther(_swapAmount.toString());
      //检查用户是否输入了0 用到了ethers.js里面 BigNumber类的eq方法
      if (!_swapAmountWEI.eq(zero)) {
        const provider = await getProviderOrSigner();
        // 合约的eth数量
        const _ethBalance = await getEtherBalance(provider, null, true);
        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
          _swapAmountWEI,
          provider,
          ethSelected,
          _ethBalance,
          reservedCD
        );
        settokenToBeReceivedAfterSwap(amountOfTokens);
      } else {
        settokenToBeReceivedAfterSwap(zero);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =============================ADD LIQUIDITY FUNCTIONS  ========================
  const _addLiquidity = async () => {
    try {
      const addEtherWei = utils.parseEther(addEther.toString());
      if (!addCDTokens.eq(zero) && !addEtherWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);

        // 调用utils里的addLiquidity函数
        await addLiquidity(signer, addCDTokens, addEtherWei);
        setLoading(false);
        //这里重新初始化 CD Token 在上面的代码中哪里修改过addCDTokens用户想要添加到流动性池的CD Token的数量的值
        // 在addLiquidity中
        // 重新初始化 CD Token
        setAddCDTokens(zero);
        // 增加流动性之后更新所有数据
        await getAmounts();
      } else {
        setAddCDTokens(zero);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setAddCDTokens(zero);
    }
  };
  // ============================= REMOVE LIQUIDITY FUNCTIONS  ========================
  // 从流动性中移除' removeLPTokensWei '数量的LP Token
  // 并计算eth和CD代币的量
  const _removeLiquidity = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      // 将用户输入的LP Token转为BigNumebr
      const removeLPTokensWei = utils.parseEther(removeLPTokens);
      setLoading(true);
      // 调用utils里的removeLiquidity函数
      await removeLiquidity(signer, removeLPTokensWei);
      setLoading(false);
      await getAmounts();
      setRemoveCD(zero);
      setRemoveEther(zero);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEther(zero);
    }
  };

  // 在用户从流动性中删除' removeLPTokenWei '数量的LP Token后
  // 计算要返回给用户的' Ether '和' CD '令牌的数量
  //  这个函数是在计算要给用户返回多少' Ether '和' CD '令牌
  //  _removeLiquidity函数是真正地给用户返回' Ether '和' CD '令牌
  const _getTokensAfterRemremoveCDneeove = async (_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner();
      // 将用户输入的LP Token转为BigNumebr
      const removeLPTokenWei = utils.parseEther(_removeLPTokens);
      //得到exchange合约中eth的储存量
      const _ethBalance = await getEtherBalance(provider, null, true);
      // 得到exchange合约中存储的CD Token数量
      const cryptoDevTokenReserve = await getReserveOfCDTokens(provider);
      const { _removeEther, _removeCD } = await getTokensAfterRemove(
        provider,
        removeLPTokenWei,
        _ethBalance,
        cryptoDevTokenReserve
      );
      console.log("|_removeEther", _removeEther);
      setRemoveEther(_removeEther);
      setRemoveCD(_removeCD);
    } catch (err) {
      console.error(err);
    }
  };
  // ============================= HELPER FUNCTIONS========================
  const connectWallet = async () => {
    try {
      // 从web3Modal获取provider，在我们的例子中是MetaMask
      //第一次使用时，它会提示用户连接他们的钱包
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    web3ModalRef.current = new Web3Modal({
      network: "goerli",
      providerOptions: {},
      disableInjectedProvider: false,
    });
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

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

  useEffect(() => {
    // 没有连接钱包的话，就创建一个新的Web3Modal实例 并连接钱包
    if (!walletConnected) {
      // 通过设置Web3Modal类的“current”值，将它分配给引用对象
      //只要这个页面是打开的，' current '值就会一直保持
      // web3ModalRef.current = new Web3Modal({
      //   network: "goerli",
      //   providerOptions: {},
      //   disableInjectedProvider: false,
      // });
      // connectWallet();
      // getAmounts();
    }
  }, [walletConnected]);

  // ============================= RENDER FUNCTIONS========================
  const renderButton = () => {
    // // 提示连接钱包的按钮
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
        // <div
        //   style={{
        //     border: "1px solid #b6b5b5",
        //     borderRadius: "20px",
        //     padding: "10px",
        //     fontSize: "14px",
        //     display: "flex",
        //     justifyContent: "center",
        //     margin: "auto",
        //     width: "20%",
        //   }}
        // >
        //   <ConnectWalletButton></ConnectWalletButton>
        // </div>
      );
    }

    if (loading) {
      // return <button className={styles.button}>loading</button>;
      return <Loading />;
    }

    if (liquidityTab) {
      return (
        <div>
          {/* <Canvas className={styles.assetsPurple}>
            <OrbitControls enableZoom={false}></OrbitControls>
            <ambientLight intensity={0.5} />
            <directionalLight position={[-2, 5, 2]} intensity={1} />
            <Suspense fallback={null}>
              <AnimatedSphere></AnimatedSphere>
            </Suspense>
          </Canvas>
          <Canvas className={styles.assetsPurpleSmall}>
            <OrbitControls enableZoom={false}></OrbitControls>
            <ambientLight intensity={0.5} />
            <directionalLight position={[-2, 5, 2]} intensity={1} />
            <Suspense fallback={null}>
              <AnimatedSphereSmall></AnimatedSphereSmall>
            </Suspense>
          </Canvas>
          <Canvas className={styles.assetsPurpleBig}>
            <OrbitControls enableZoom={false}></OrbitControls>
            <ambientLight intensity={0.5} />
            <directionalLight position={[-2, 5, 2]} intensity={1} />
            <Suspense fallback={null}>
              <AnimatedSphereBig></AnimatedSphereBig>
            </Suspense>
          </Canvas> */}
          <div style={{ background: "#000" }}>
            <div className={styles.assets}>
              {/* data-aos="fade-up" data-aos-delay="400" data-aos-easing="ease" */}
              You have:
              <br />
              {/* 将BigNumber转为String */}
              <strong>{utils.formatEther(cdBalance).slice(0, 6)}</strong> Crypto
              Dev Tokens
              <br />
              <strong> {utils.formatEther(ethBalance).slice(0, 6)}</strong>{" "}
              Ether
              <br />
              <strong>{utils.formatEther(lpBalance).slice(0, 6)}</strong> Crypto
              Dev LP tokens
            </div>
            <div className={styles.wrapper}>
              {/* 如果存储的CD为零，则在询问用户他想要加入多少初始流动性时
                将流动性状态渲染为零
                否则渲染这样的状态：流动性不为0
                我们根据用户指定的“Eth”数量计算可以添加多少“CD”令牌 */}
              {utils.parseEther(reservedCD.toString()).eq(zero) ? (
                <div>
                  <input
                    type="number"
                    placeholder="Amount of Ether"
                    onChange={(e) => setAddEther(e.target.value || "0")}
                    className={styles.input}
                    min="0"
                  />
                  {/* todo 这里为什么setAddEther没有转为ether而setAddCDTokens就要转为ether还转为BigNumber */}
                  <input
                    type="number"
                    placeholder="Amount of CryptoDev tokens"
                    onChange={(e) =>
                      setAddCDTokens(
                        BigNumber.from(utils.parseEther(e.target.value))
                      )
                    }
                    className={styles.input}
                  />
                  <button className={styles.button1} onClick={_addLiquidity}>
                    Add
                  </button>
                </div>
              ) : (
                <div className={styles.wrapperOne}>
                  <input
                    type="number"
                    min="0"
                    placeholder="Amount of Ether"
                    onChange={async (e) => {
                      setAddEther(e.target.value || "0");
                      // 计算可以添加的CD Token的数量
                      const _addCDTokens = await calculateCD(
                        e.target.value || "0",
                        etherBalanceContract,
                        reservedCD
                      );
                      setAddCDTokens(_addCDTokens);
                    }}
                    className={styles.input}
                  ></input>
                  <div className={styles.inputDiv}>
                    {`You will need ${utils
                      .formatEther(addCDTokens)
                      .slice(0, 5)} Crypto Dev Tokens`}
                  </div>
                  <button className={styles.button1} onClick={_addLiquidity}>
                    Add
                  </button>
                </div>
              )}

              <div className={styles.wrapperTwo}>
                <input
                  type="number"
                  min="0"
                  placeholder="Amount of LP Tokens"
                  onChange={async (e) => {
                    setRemoveLPTokens(e.target.value || "0");
                    // 计算在移除LPToken之后要返回给用户多少eth和CD token
                    await _getTokensAfterRemremoveCDneeove(
                      e.target.value || "0"
                    );
                  }}
                  className={styles.input}
                ></input>
                <div className={styles.inputDiv}>
                  {`You will get ${utils
                    .formatEther(removeCD)
                    .slice(0, 5)} Crypto Dev Tokens and ${utils
                    .formatEther(removeEther)
                    .slice(0, 5)} Eth`}
                </div>
                <button className={styles.button1} onClick={_removeLiquidity}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <input
            type="number"
            min="0"
            placeholder="Amount"
            onChange={async (e) => {
              setSwapAmount(e.target.value || "");
              // 计算用户会接收到的token数量
              await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
            }}
            className={styles.input}
            value={swapAmount}
          ></input>
          <select
            className={styles.select}
            name="dropdown"
            id="dropdown"
            onChange={async () => {
              setEthSelected(!ethSelected);
              await _getAmountOfTokensReceivedFromSwap(0);
              setSwapAmount("");
            }}
          >
            <option value="eth">Eth</option>
            <option value="cryptoDevToken">Crypto Dev Token</option>
          </select>
          <br />
          <div className={styles.inputDiv}>
            {ethSelected
              ? `You will get ${utils
                  .formatEther(tokenToBeReceivedAfterSwap)
                  .slice(0, 5)} Crypto Dev Tokens`
              : `You will get ${utils
                  .formatEther(tokenToBeReceivedAfterSwap)
                  .slice(0, 5)} Eth`}
          </div>
          <button className={styles.button1} onClick={_swapTokens}>
            SWAP
          </button>
        </div>
      );
    }
  };

  return (
    <WagmiConfig client={wagmiClient}>
      <div style={{ height: "100vh" }}>
        <Head>
          <title>Crypto Devs</title>
          <meta name="description" content="Whitelist-Dapp" />
          <link rel="icon" href="/favicon.ico" />
          {/* <audio autoplay="autoplay" controls="controls">
          <source
            src="https://music.163.com/#/discover/toplist?id=7356827205"
            type="audio/mpeg"
          />
          
        </audio> */}
        </Head>

        {/* <canvas className={styles.webgl} id="webgl" /> */}
        <Header></Header>

        <div className={styles.pageOne}>
          <Canvas
            style={{ position: "absolute", background: "#000" }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              outputEncoding: THREE.sRGBEncoding,
            }}
            camera={{
              fov: 45,
              near: 0.1,
              far: 200,
              position: [2, 3, 3],
            }}
          >
            <OrbitControls enableZoom={false}></OrbitControls>
            <ambientLight intensity={0.5} />
            <directionalLight position={[-2, 5, 2]} intensity={1} />
            <Suspense fallback={null}>
              <EarthSphere />
            </Suspense>
          </Canvas>

          <div className={styles.typeIt}>
            <TypeIt className={styles.title}>
              Welcome to Crypto Devs Exchange!
            </TypeIt>
          </div>
        </div>

        <div className={styles.pageTwo}>
          <div
            className={styles.main}
            // data-aos="fade-up"
            // data-aos-delay="400"
            // data-aos-easing="ease"
          >
            <div>
              {/* <h1 className={styles.title}>Welcome to Crypto Devs Exchange!</h1> */}
              <div className={styles.description}>
                Exchange Ethereum &#60;&#62; Crypto Dev Tokens
              </div>
              <div>
                <button
                  className={styles.button}
                  onClick={() => {
                    console.log(" setLiquidityTab");
                    setLiquidityTab(true);
                  }}
                >
                  Liquidity
                </button>
                <button
                  className={styles.button}
                  onClick={() => {
                    setLiquidityTab(false);
                  }}
                >
                  Swap
                </button>
              </div>
            </div>

            {/* <Canvas className="canvas">
            <OrbitControls enableZoom={false}></OrbitControls>
            <ambientLight intensity={0.5} />
            <directionalLight position={[-2, 5, 2]} intensity={1} />
            <Suspense fallback={null}>
              <Ethcoin />
            </Suspense>
          </Canvas> */}
            {renderButton()}
          </div>
          <div className={styles.footer}> Made with &#10084; by Naomi</div>
        </div>
      </div>
    </WagmiConfig>
  );
}
