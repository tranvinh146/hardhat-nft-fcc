import { network } from "hardhat";
import { DeployFunction, Deployment } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";
import fs from "fs";

const SVG_HIGN_IMAGE = "";
const SVG_LOW_IMAGE = "";

const deployDynamicSvgNft: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;
    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        const aggretorV3Mock: Deployment = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = aggretorV3Mock.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    const lowSvg = fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf-8" });
    const highSvg = fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf-8" });
    const args = [ethUsdPriceFeedAddress, lowSvg, highSvg];

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: networkConfig[chainId].blockConfirmations || 1,
    });

    log("----------------------------------");

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verify...");
        await verify(dynamicSvgNft.address, args);
        log("----------------------------------");
    }
};

deployDynamicSvgNft.tags = ["all", "dynamicSvgNft", "main"];

export default deployDynamicSvgNft;
