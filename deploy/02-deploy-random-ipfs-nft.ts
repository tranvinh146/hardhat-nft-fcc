import { ethers } from "hardhat";
import { Address, DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, DOG_TOKEN_URIS, networkConfig } from "../helper-hardhat-config";
import { storeImages, storeTokenUriMetadata } from "../utils/uploadToPinata";
import verify from "../utils/verify";

type TokenUriMetaData = {
    name: string;
    description: string;
    image: string;
    attributes: object[];
};

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30");
const imagesLocation = "images/randomNft";

const deployBasicNft: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;
    let vrfCoordinatorV2Address: Address;
    let subscriptionId: string;
    let tokenUris: string[];

    // get the IPFS hashes of my images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris();
    }

    log("----------------------------------");

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;

        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txReceipt = await tx.wait(1);
        subscriptionId = txReceipt.events[0].args.subId;
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]!;
        subscriptionId = networkConfig[chainId]["subscriptionId"]!;
    }

    // const gasLane = networkConfig[chainId]["gasLane"];
    // const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
    // const mintFee = networkConfig[chainId]["mintFee"];

    // const args: any[] = [
    //     vrfCoordinatorV2Address,
    //     subscriptionId,
    //     gasLane,
    //     callbackGasLimit,
    //     // tokenUris,
    //     mintFee
    // ];

    // const waitBlockConfirmations = networkConfig[chainId]["blockConfirmations"];

    // const raffle = await deploy("RandomIpfsNft", {
    //     from: deployer,
    //     args: args,
    //     log: true,
    //     waitConfirmations: waitBlockConfirmations
    // });

    // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //     log("Verify...");
    //     await verify(raffle.address, args);
    // }

    log("----------------------------------");
};

async function handleTokenUris(): Promise<string[]> {
    let tokenUris: string[] = [];

    // store images on IPFS
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation);
    const attributes = [
        {
            trait_type: "Cuteness",
            value: "100"
        }
    ];
    // store metadata on IPFS
    for (let imageUploadResponseIndex in imageUploadResponses) {
        // create metadata
        const name = files[imageUploadResponseIndex].replace(".png", "");
        const description = `An adorable ${name}`;
        const image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
        let tokenUriMetadata: TokenUriMetaData = {
            name,
            description,
            image,
            attributes
        };
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata);
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
    }
    console.log("Uploaded Metadata Successfully!");
    console.log(tokenUris);
    return tokenUris;
}

deployBasicNft.tags = ["all", "randomIpfsNft"];

export default deployBasicNft;
