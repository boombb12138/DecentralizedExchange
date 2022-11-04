const { ethers } = require("hardhat");

require("dotenv").config({ path: ".env" });
const { CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  const cryptoDevTokenAddress = CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS;
  const exchangeContract = await ethers.getContractFactory("Exchange");

  // 部署合约
  const deplyedExchangeContract = await exchangeContract.deploy(
    cryptoDevTokenAddress
  );
  await deplyedExchangeContract.deployed();

  // 打印合约地址
  console.log("Exchange Contract Address:", deplyedExchangeContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
