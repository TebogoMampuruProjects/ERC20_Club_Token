const { expect } = require("chai");
const hre = require("hardhat");

describe("ClubToken contract", function() {
  // global variables
  let Token;
  let clubToken;
  let owner;
  let address1;
  let address2;
  let tokenCap = 5000000;
  let tokenBlockReward = 5;

  beforeEach(async function () {
    // Obtain the contractFactory and Signers.
    Token = await ethers.getContractFactory("ClubToken");
    [owner, address1, address2] = await hre.ethers.getSigners();

    clubToken = await Token.deploy(tokenCap, tokenBlockReward);
  });

  describe("Deployment", function () {
    it("Test the right owner", async function () {
      expect(await clubToken.owner()).to.equal(owner.address);
    });

    it("Test total supply of tokens to owner", async function () {
      const ownerBalance = await clubToken.balanceOf(owner.address);
      expect(await clubToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Test max cap", async function () {
      const cap = await clubToken.cap();
      expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(tokenCap);
    });

    it("Test BlockReward", async function () {
      const blockReward = await clubToken.blockReward();
      expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(tokenBlockReward);
    });
  });

  describe("Transactions", function () {
    it("Test the transfer functionality", async function () {
      // Transfer 5 tokens from owner to address1
      await clubToken.transfer(address1.address, 5);
      const address1Balance = await clubToken.balanceOf(address1.address);
      expect(address1Balance).to.equal(5);

      // Transfer 2 tokens from address1 to address2
      // Using .connect(signer) to send a transaction from another account
      await clubToken.connect(address1).transfer(address2.address, 2);
      const address2Balance = await clubToken.balanceOf(address2.address);
      expect(address2Balance).to.equal(2);
    });

    it("Test that the transfer-functionality fails if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await clubToken.balanceOf(owner.address);
      // Try to send 3 token from address1 (0 tokens) to owner (2000000 tokens).
      // `require` will fail and revert the transaction.
      await expect(
        clubToken.connect(address1).transfer(owner.address, 3)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Check that owner balance didn't change.
      expect(await clubToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Test that the bslance is updated after a successful transfer", async function () {
      const initialOwnerBalance = await clubToken.balanceOf(owner.address);

      // Transfer 5 tokens from owner to address1.
      await clubToken.transfer(address1.address, 5);

      // Transfer 10 tokens from owner to address2.
      await clubToken.transfer(address2.address, 10);

      // Check Available balances.
      const finalOwnerBalance = await clubToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(15));

      const address1Balance = await clubToken.balanceOf(address1.address);
      expect(address1Balance).to.equal(5);

      const address2Balance = await clubToken.balanceOf(address2.address);
      expect(address2Balance).to.equal(10);
    });
  });
  
});