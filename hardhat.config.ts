import { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "dotenv/config";
import "hardhat-deploy";

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: "0.4.19" }, { version: "0.6.12" }]
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL
            }
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
