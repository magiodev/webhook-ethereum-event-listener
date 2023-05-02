require("dotenv").config();
const ethers = require("ethers");

// Instance provider configuration
const provider = new ethers.providers.JsonRpcProvider(
  `${process.env.INFURA_TESTNET_API}`
);

module.exports = { provider };
