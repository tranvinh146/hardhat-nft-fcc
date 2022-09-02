import { assert } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { BasicNft } from "../../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT Unit Test", () => {
          let basicNft: BasicNft;
          let deployer: string;

          beforeEach(async () => {
              await getNamedAccounts()
                  .then(response => (deployer = response.deployer))
                  .catch(e => console.error(e));

              await deployments.fixture(["basicNft"]);

              basicNft = await ethers.getContract("BasicNft", deployer);
          });

          describe("constructor", () => {
              it("should intialize NFT correctly", async () => {
                  const nftName = await basicNft.name();
                  const nftSymbol = await basicNft.symbol();
                  const tokenCounter = await basicNft.getTokenCounter();
                  const tokenURI = await basicNft.tokenURI(0);

                  assert.equal(nftName, "MyDog");
                  assert.equal(nftSymbol, "PUG");
                  assert.equal(tokenCounter.toNumber(), 0);
                  assert.equal(tokenURI, await basicNft.TOKEN_URI());
              });
          });

          describe("mintNft", () => {
              it("should increase tokenCounter", async () => {
                  await basicNft.mintNft();
                  const tokenCounter = await basicNft.getTokenCounter();
                  assert.equal(tokenCounter.toNumber(), 1);
              });
          });
      });
