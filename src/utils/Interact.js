require("dotenv").config();
const { ethers } = require("ethers");
const Contract = require("./Contract");

const provider = new ethers.providers.JsonRpcProvider(
  `${process.env.PROVIDER_TESTNET_HTTPS}`
);

const signerDc9 = new ethers.Wallet(process.env.PRIVATE_KEY_Dc9, provider);
const signerb3D = new ethers.Wallet(process.env.PRIVATE_KEY_b3D, provider);

// Instance Smart Contracts
const marketPlaceSC = new ethers.Contract(
  process.env.MARKETPLACE_ADDRESS,
  Contract.getABI("marketplace"),
  provider
);
const skinSC = new ethers.Contract(
  process.env.SKIN_ADDRESS,
  Contract.getABI("skill"),
  provider
);

const skillSC = new ethers.Contract(
  process.env.SKILL_ADDRESS,
  Contract.getABI("skin"),
  provider
);

const erc1155MockUp = new ethers.Contract(
  process.env.ERC1155MOCKUP_ADDRESS,
  Contract.getABI("1155MockUp"),
  provider
);

async function sell(contractNFT, seller, tokenId) {
  //   await contractNFT.connect(seller).approve(contractNFT.address, tokenId);
  await marketPlaceSC
    .connect(seller)
    .sellToken(contractNFT.address, tokenId, 1, 100, false);
}

async function buy(contractNFT, buyer, seller, tokenId) {
  //   await contractNFT.connect(seller).approve(contractNFT.address, tokenId);
  await marketPlaceSC
    .connect(buyer)
    .buyToken(contractNFT.address, tokenId, seller.address);
}

async function removeToken(contractNFT, seller, tokenId) {
  //   await contractNFT.connect(seller).approve(contractNFT.address, tokenId);
  await marketPlaceSC
    .connect(seller)
    .removeToken(contractNFT.address, seller.address, tokenId);
}

async function approveSkin(owner, tokenId) {
  await skinSC.connect(owner).approve(marketPlaceSC.address, tokenId);
}

async function main() {
  // TODO! Mint tokens
  // TODO! Approve MarketPlace to manage them
  // TODO! List them to sale
  // TODO! Buy some & Remove some

  // for (let i = 0; i < 10; i++) {
  //   await skinSC.connect(signerb3D).safeMint(signerb3D.address, 0);
  // }

  // // // Approval
  // await skinSC.connect(signerb3D).approve(marketPlaceSC.address, 18);
  // await skinSC.connect(signerb3D).approve(marketPlaceSC.address, 19);
  // await skinSC.connect(signerb3D).approve(marketPlaceSC.address, 20);
  // await skinSC.connect(signerb3D).approve(marketPlaceSC.address, 21);
  // await skinSC.connect(signerb3D).approve(marketPlaceSC.address, 22);
  // await skinSC.connect(signerb3D).approve(marketPlaceSC.address, 23);
  await skinSC.connect(signerb3D).approve(marketPlaceSC.address, 26);

  // await sell(skinSC, signerb3D, 18);
  // await sell(skinSC, signerb3D, 19);
  // await sell(skinSC, signerb3D, 20);
  // await sell(skinSC, signerb3D, 21);
  // await sell(skinSC, signerb3D, 22);
  // await sell(skinSC, signerb3D, 23);
  await sell(skinSC, signerb3D, 26);

  await buy(skinSC, signerDc9, signerb3D, 26);
  // await buy(skinSC, signerDc9, signerb3D, 23);
  // await approveSkin(signerDc9, 1);
  // await approveSkin(signerDc9, 2);
  // await approveSkin(signerDc9, 3);
  // await sell(skinSC, signerDc9, 1);
  // await sell(skinSC, signerDc9, 3);
  // await sell(skinSC, signerDc9, 2);
  // sell(skillSC, signerb3D, 8);

  // await removeToken(skinSC, signerb3D, 21);
}

main();
