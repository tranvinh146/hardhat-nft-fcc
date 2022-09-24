import { BigNumber } from "ethers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";
import { BasicNft, DynamicSvgNft, RandomIpfsNft, VRFCoordinatorV2Mock } from "../typechain-types";

const mintFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // Basic NFT
    const basicNft: BasicNft = await ethers.getContract("BasicNft");
    const basicNftTx = await basicNft.mintNft();
    await basicNftTx.wait(1);
    console.log(`Basic NFT index 0 has token URI: ${await basicNft.tokenURI(0)}`);

    // Random IPFS NFT
    const randomIpfsNft: RandomIpfsNft = await ethers.getContract("RandomIpfsNft");
    const mintFee = await randomIpfsNft.getMintFee();
    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({ value: mintFee });
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1);

    await new Promise<void>(async (resolve, reject) => {
        setTimeout(reject, 300000);
        randomIpfsNft.once("NftMinted", async function () {
            resolve();
        });

        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNftMintTxReceipt!.events![1].args!.requestId.toString();
            const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract(
                "VRFCoordinatorV2Mock"
            );
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address);
        }
    });
    console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`);

    // Dynamic NFT
    const dynamicNft: DynamicSvgNft = await ethers.getContract("DynamicSvgNft");
    const mintDynamicNftTx = await dynamicNft.mintNft(ethers.utils.parseEther("2000"));
    await mintDynamicNftTx.wait(1);
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicNft.tokenURI(0)}`);
};

mintFunc.tags = ["all", "mint"];

export default mintFunc;
