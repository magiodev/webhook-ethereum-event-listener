require("dotenv").config();
const express = require("express");
const { Listeners } = require("./src/Listener");
const { Sync } = require("./src/Sync");
const axios = require("axios");

const PORT = process.env.PORT || 3000;
const app = express();

const API_URL = process.env.API_URL;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN;

// let fromBlockNumber = "29326769"; // Add blockNumber to Query from the one the server stopped + 1
let fromBlockNumber;

app.listen(PORT, async () => {
  console.log(`\nSERVER: Server running on http://localhost:${PORT}`);

  let response = await axios.get(`${API_URL}/blockchain/blocknumber`, {
    headers: {
      Authorization: API_BEARER_TOKEN,
      "Content-Type": "application/json",
    },
  });

  // From block number must be substracted to start from the last block number (As it will start from the next Block number set)
  fromBlockNumber = response.data.blockNumber;
  // -Infinity is the default value set in the DB.
  if (response.data.blockNumber === "-Infinity") {
    fromBlockNumber = process.env.BLOCK_NUMBER - 1;
  }
  console.log("Running from Block Number:", fromBlockNumber);

  // Sync past events
  await Sync.ListenerMarketPlaceSelltoken(fromBlockNumber);
  await Sync.ListenerMarketPlaceBuyToken(fromBlockNumber);
  await Sync.ListenerMarketPlaceRemoveToken(fromBlockNumber);

  // List new events
  Listeners.ListenerMarketPlaceSelltoken();
  Listeners.ListenerMarketPlaceBuyToken();
  Listeners.ListenerMarketPlaceRemoveToken();
});

// Error handling
app.on("error", (error) => {
  console.error(`Server error: ${error}`);
  app.close();
  setTimeout(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }, 1000);
});
