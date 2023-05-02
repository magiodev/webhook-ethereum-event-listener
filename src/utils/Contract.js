const fs = require("fs");
const path = require("path");

const Contract = {
  getABI(contractName) {
    return contractName
      ? JSON.parse(
          fs.readFileSync(
            path.join(__dirname, "../../ABI/" + contractName + ".json")
          )
        )["abi"]
      : null;
  },

  //   getAddress(contractName) {
  //     return contractName
  //       ? JSON.parse(
  //           fs.readFileSync(
  //             path.join(__dirname, "../../ABI/addresses.json")
  //           )
  //         )[contractName][process.env.PROVIDER_CHAIN_ID]
  //       : null;
  //   },
};

module.exports = Contract;
