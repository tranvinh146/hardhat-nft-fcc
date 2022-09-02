import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { resolve } from "path";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { RandomIpfsNft, VRFCoordinatorV2Mock } from "../../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT Unit Test", () => {
          let randomIpfsNft: RandomIpfsNft;
          let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
          let deployer: string;

          const chainId = network.config.chainId!;
          const mintFee = networkConfig[chainId]["mintFee"];

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["mocks", "randomIpfsNft"]);
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
              randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
          });

          describe("constructor", () => {
              it("should intialize Random IPFS NFT correctly", async () => {
                  const mintFee = await randomIpfsNft.getMintFee();
                  const lastTokenUri = await randomIpfsNft.getDogTokenUris(2);
                  assert.equal(mintFee.toString(), networkConfig[chainId]["mintFee"]);
                  assert(lastTokenUri.includes("ipfs://"));
                  await expect(randomIpfsNft.getDogTokenUris(3)).to.be.reverted;
              });
          });

          describe("mint RIN", () => {
              it("requestNft should revert when not enough ETH", async () => {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NotEnoughMintFee"
                  );
              });

              it("requestNft should emit event", async () => {
                  await expect(randomIpfsNft.requestNft({ value: mintFee })).to.be.emit(
                      randomIpfsNft,
                      "NftRequested"
                  );
              });

              it("should create random and mint NFT", async () => {
                  await new Promise<void>(async (resolve, reject) => {
                      randomIpfsNft.once("NftRequested", async () => {
                          try {
                              // requestId = 1
                              const pugNFT = await randomIpfsNft.getBreedDogFromModdedRng(1);
                              const tokenCounter = await randomIpfsNft.getTokenCounter();
                              const pugOwner = await randomIpfsNft.ownerOf(tokenId);
                              const tokenUri = await randomIpfsNft.tokenURI(tokenId);

                              assert.equal(requestId, 1);
                              assert.equal(pugNFT, 0);
                              assert.equal(tokenCounter.toNumber(), 1);
                              assert.equal(pugOwner, deployer);
                              assert(tokenUri.includes("ipfs://"));
                              resolve();
                          } catch (error) {
                              reject(error);
                          }
                      });
                      const tokenId = await randomIpfsNft.getTokenCounter();
                      const tx = await randomIpfsNft.requestNft({ value: mintFee });
                      const txReceipt = await tx.wait(1);
                      const requestId = txReceipt.events![1].args!.requestId;
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          requestId,
                          randomIpfsNft.address
                      );
                  });
              });
          });
      });
