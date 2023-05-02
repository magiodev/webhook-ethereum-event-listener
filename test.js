const axios = require("axios");

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: "http://127.0.0.1:1337/api/blockchain/blocknumber",
  headers: {
    Authorization:
      "Bearer 68b358bd7f57c7c1af5c895fecd32139d757b972099209edb42f7cb65f5ea37f47eddea650a97507c7396cbb997d5b30f2ffce38fab00c5544b15026b2656613581eb9c3b8b762dcc88b37a9289406082df1c40d7b22312a9d08d03828831369ac928c2aebba1566d16f9fa2e4652f5d53468d14dc085c797f3315f2c43ddf03",
  },
};

axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
