// SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// 交易需要造币所以继承自ERC20
contract Exchange is ERC20 {
    address public cryptoDevTokenAddress;

    constructor(address _CryptoDevtoken) ERC20("CryptoDev LP Token", "CDLP") {
        require(
            _CryptoDevtoken != address(0),
            "Token address passed is a null address"
        );
        cryptoDevTokenAddress = _CryptoDevtoken;
    }

    // 返回合约中拥有的Crypto Dev Tokens数量
    function getReserve() public view returns (uint256) {
        return ERC20(cryptoDevTokenAddress).balanceOf(address(this));
    }

    // 往交易所中添加流动性
    function addLiquidity(uint256 _amount) public payable returns (uint256) {
        uint256 liquidity;
        uint256 ethBalance = address(this).balance;
        uint256 cryptoDevTokenReserve = getReserve();
        ERC20 cryptoDevToken = ERC20(cryptoDevTokenAddress);

        // 如果储备为0，接受任何用户提供的eth或`Crypto Dev` tokens 因为现在没有比例
        if (cryptoDevTokenReserve == 0) {
            // 将' cryptoDevToken '从用户的帐户转移到合约
            cryptoDevToken.transferFrom(msg.sender, address(this), _amount);
            // 获取当前的ethBalance并向用户生成‘ethBalance’数量的LP令牌。
            //因为这是第一个LP，LP提供的ETH就等于合约的ETH余额
            //又因为 给LP提供的LP代币与存入的ETH数量成正比
            // 所以给LP提供的LP token的数量就是合约中eth的余额
            liquidity = ethBalance;
            //   _mint是ERC20合约中mint ERC20token的方法
            _mint(msg.sender, liquidity);
            //
        } else {
            // 如果储备不为空，则接收用户提供的eth,并根据比例确定需要提供多少' Crypto Dev '代币
            // EthReserve应该是当前的ethBalance减去用户发送的eth值
            uint256 ethReserve = ethBalance - msg.value;
            // 比率应该始终保持，这样在增加流动性时就不会对价格产生重大影响
            //(cryptoDevTokenAmount用户可以添加的代币数量)=(用户发送的Eth * cryptoDevTokenReserve /Eth Reserve);
            uint256 cryptoDevTokenAmount = (msg.value * cryptoDevTokenReserve) /
                (ethReserve);
            require(
                _amount >= cryptoDevTokenAmount,
                "Amount of tokens sent is less than the minimum tokens required"
            );
            // 仅从用户帐户转账(cryptoDevTokenAmount用户可以添加)数量的' Crypto Dev token '到合同
            cryptoDevToken.transferFrom(
                msg.sender,
                address(this),
                cryptoDevTokenAmount
            );
            // 将发送给用户的LP代币的数量应该与用户添加的eth的流动性成正比
            //这里要保持的比率是->
            //(发送给用户的LP代币(流动性)/总合同中LP代币的供应量)=(用户发送的Eth)/(合同中的Eth储备)
            //通过一些数学运算->流动性=(合同中LP代币的总供应量*(用户发送的Eth))/(合同中的Eth储备)
            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    // 删除流动性
    // 返回在交易中返回给用户的eth和Dev token的数量
    function removeLiquidity(uint256 _amount)
        public
        returns (uint256, uint256)
    {
        require(_amount > 0, "_amount should be greater than zero");
        uint256 ethReserve = address(this).balance;
        uint256 _totalSupply = totalSupply();

        // 将发送回用户的Eth的数量是基于比例的
        uint256 ethAmount = (ethReserve * _amount) / _totalSupply;
        // 将发送回用户的Crypto Dev token的数量是基于比例的
        uint256 cryptoDevTokenAmount = (getReserve() * _amount) / _totalSupply;
        // /从用户的钱包中烧掉LP token，因为它们已经被发送到删除流动性
        _burn(msg.sender, _amount);
        // todo 将'ethAmount'的eth从合同转移到用户的钱包   这里为什么用payable
        payable(msg.sender).transfer(ethAmount);
        // 将“cryptoDevTokenAmount”数量的Crypto Dev token从合同转移到用户的钱包
        ERC20(cryptoDevTokenAddress).transfer(msg.sender, cryptoDevTokenAmount);
        return (ethAmount, cryptoDevTokenAmount);
    }

    // 返回在交易中将要返回给用户的Eth/Crypto Dev tokens数量
    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
        //收 1%的手续费之后
        uint256 inputAmountWithFee = inputAmount * 99;
        //要确保 Δy = (y * Δx) / (x + Δx)
        // Δy就是接受的token x = inputReserve, y = outputReserve
        // (y * Δx)
        uint256 numerator = inputAmountWithFee * outputReserve;
        // (x + Δx)
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    // 用eth来交换token
    function ethToCryptoDevToken(uint256 _minTokens) public payable {
        uint256 tokenReserve = getReserve();

        // 获取在交易中将要返回给用户的Crypto Dev tokens数量
        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );

        require(tokensBought >= _minTokens, "insufficient output amount");
        // 将`Crypto Dev` tokens 返回给用户
        ERC20(cryptoDevTokenAddress).transfer(msg.sender, tokensBought);
    }

    // 用token来交换eth
    function cryptoDevTokenToEth(uint256 _tokensSold, uint256 _minEth) public {
        uint256 tokenReserve = getReserve();

        // 获取在交易中将要返回给用户的eth数量
        uint256 ethBought = getAmountOfTokens(
            _tokensSold,
            tokenReserve,
            address(this).balance
        );
        require(ethBought >= _minEth, "insufficient output amount");
        // 将`Crypto Dev` tokens 从用户返回给合约
        ERC20(cryptoDevTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );
        // 从合约发送ethBought数量的eth给用户
        payable(msg.sender).transfer(ethBought);
    }
}
