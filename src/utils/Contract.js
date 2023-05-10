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
};

module.exports = Contract;
