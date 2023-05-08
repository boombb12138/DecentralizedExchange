import React, { useState } from "react";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ConnectWalletButton } from "./ConnectWallet";

const Header = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [governance, setGovernance] = useState(null);
  const router = useRouter();

  const toggleDrawer = (open) => (event) => {
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setOpenMenu(open);
  };

  return (
    <div
      height={{ md: "128px", sm: "120px", xs: "120px" }}
      style={{
        color: "#eee",
        display: "flex",
        justifyContent: "right",
        alignItems: "center",

        backgroundColor: "#000",
        margin: "auto",
      }}
    >
      <div style={{ marginRight: "10%", display: "flex", padding: "1rem 0" }}>
        <div
          onClick={() => {
            router.push("/");
          }}
          display="flex"
          style={{ cursor: "pointer", marginRight: "2rem" }}
        >
          Home
        </div>
        <div
          onClick={() => {
            router.push("/ico");
          }}
          display="flex"
          style={{ cursor: "pointer" }}
        >
          Token
        </div>
        {/* <ConnectWalletButton /> */}
      </div>
    </div>
  );
};

export default Header;
