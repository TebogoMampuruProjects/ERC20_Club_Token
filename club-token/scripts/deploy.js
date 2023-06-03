const hre = require("hardhat");

async function main() {
  const ClubToken = await hre.ethers.getContractFactory("ClubToken");
  const clubToken = await ClubToken.deploy(2000000, 5);

  await clubToken.deployed();

  console.log("Club Token deployed successfully: ", clubToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});