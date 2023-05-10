require("dotenv").config();
const ethers = require("ethers");

// Instance provider configuration
const provider = new ethers.providers.JsonRpcProvider(
  `${process.env.PROVIDER_TESTNET_HTTPS}`
);

module.exports = { provider };
