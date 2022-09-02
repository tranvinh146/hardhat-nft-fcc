import { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "dotenv/config";
import "hardhat-deploy";

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "";

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: "0.8.7" }]
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337
            // forking: {
            //     url: MAINNET_RPC_URL
            // }
        },
        rinkeby: {
            chainId: 4,
            url: RINKEBY_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            saveDeployments: true
        }
    },
    etherscan: {
        apiKey: {
            rinkeby: ETHERSCAN_API_KEY || ""
        }
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0 // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        }
    }
};

export default config;
