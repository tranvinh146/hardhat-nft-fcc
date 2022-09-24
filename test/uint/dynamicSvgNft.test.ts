import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { DynamicSvgNft, MockV3Aggregator } from "../../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Dynamic SVG NFT unit test", () => {
          let dynamicSvgNft: DynamicSvgNft;
          let mockV3Aggregator: MockV3Aggregator;
          let deployer: string;

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["mocks", "dynamicSvgNft"]);
              dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
          });

          describe("mintNft", () => {
              it("should emit event when minting nft", async () => {
                  let highValue: BigNumber = ethers.utils.parseEther("1500");
                  await expect(dynamicSvgNft.mintNft(highValue))
                      .to.be.emit(dynamicSvgNft, "CreatedNFT")
                      .withArgs(0, highValue);
                  const tokenCounter = await dynamicSvgNft.getTokenCounter();
                  assert.equal(tokenCounter.toNumber(), 1);
              });
          });

          describe("tokenURI", () => {
              it("should revert when token doesn't exsits", async () => {
                  let highValue: BigNumber = ethers.utils.parseEther("1500");
                  await expect(dynamicSvgNft.tokenURI(0)).to.be.revertedWith(
                      "DynamicSvgNft_TokenNotFound"
                  );
              });

              it("should low image when price is lower than highValue", async () => {
                  await mockV3Aggregator.updateAnswer(ethers.utils.parseEther("1000"));
                  let highValue: BigNumber = ethers.utils.parseEther("1500");
                  await dynamicSvgNft.mintNft(highValue);
                  const tokenURI = await dynamicSvgNft.tokenURI(0);
                  const imageUri = JSON.parse(
                      Buffer.from(
                          tokenURI.replace("data:application/json;base64,", ""),
                          "base64"
                      ).toString()
                  ).image;
                  const lowImageUri = await dynamicSvgNft.getLowImageUri();
                  assert.equal(imageUri, lowImageUri);
              });

              it("should high image when price equals highValue", async () => {
                  let highValue: BigNumber = ethers.utils.parseEther("1500");
                  await dynamicSvgNft.mintNft(highValue);
                  const tokenURI = await dynamicSvgNft.tokenURI(0);
                  const imageUri = JSON.parse(
                      Buffer.from(
                          tokenURI.replace("data:application/json;base64,", ""),
                          "base64"
                      ).toString()
                  ).image;
                  const highImageUri = await dynamicSvgNft.getHighImageUri();
                  assert.equal(imageUri, highImageUri);
              });

              it("should high image when price is greater than highValue", async () => {
                  await mockV3Aggregator.updateAnswer(ethers.utils.parseEther("2000"));
                  let highValue: BigNumber = ethers.utils.parseEther("1500");
                  await dynamicSvgNft.mintNft(highValue);
                  const tokenURI = await dynamicSvgNft.tokenURI(0);
                  const imageUri = JSON.parse(
                      Buffer.from(
                          tokenURI.replace("data:application/json;base64,", ""),
                          "base64"
                      ).toString()
                  ).image;
                  const highImageUri = await dynamicSvgNft.getHighImageUri();
                  assert.equal(imageUri, highImageUri);
              });
          });
      });
