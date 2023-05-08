/* eslint-disable no-undef */
import React, { useEffect, useState, useRef } from "react";

import { getDefaultWallets, ConnectButton } from "@rainbow-me/rainbowkit";
import {
  chain,
  configureChains,
  createClient,
  useAccount,
  useDisconnect,
  useSignMessage,
} from "wagmi";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { useSelector, useDispatch } from "react-redux";

import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider, midnightTheme } from "@rainbow-me/rainbowkit";

const { chains, provider } = configureChains(
  [chain.mainnet, chain.goerli],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID,
      stallTimeout: 5000,
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "MySwap Website",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const ConnectWalletButton = () => {
  const dispatch = useDispatch();
  const { address, isConnected, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: signature, signMessageAsync } = useSignMessage();
  const addressInfo = useRef({ address });

  let setLoggedIn;
  let setLoggedOut;

  return (
    <RainbowKitProvider
      chains={chains}
      theme={midnightTheme({
        accentColor: "#000",
        // accentColor: "linear-gradient(to right, #EE230C,#000)",
        accentColorForeground: "white",
      })}
      //   avatar={CustomAvatar}
      // theme={myCustomTheme}
    >
      <ConnectButton
        label="Connect"
        showBalance={false}
        chainStatus="none"
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
      />
    </RainbowKitProvider>
  );
};

export { wagmiClient, chains, ConnectWalletButton };
