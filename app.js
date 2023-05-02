require("dotenv").config();
const express = require("express");
const { Listeners } = require("./src/Listener");
const { Sync } = require("./src/Sync");
const axios = require("axios");

const PORT = process.env.PORT || 3000;
const app = express();
//TODO: NEEDS TO BE TESTED
let status = true; // Toggle in case there is an error to turn it off to stop indexing uncompleted data.
const API_URL = process.env.API_URL;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN;

// let fromBlockNumber = "29326769"; // Add blockNumber to Query from the one the server stopped + 1
let fromBlockNumber;

// app.post(`${API_URL}/BuyToken/`, (req, res) => {
//   console.log("\nSERVER: BuyToken Event received POST");
//   res.sendStatus(200);
// });
// app.post(`/SellToken/`, (req, res) => {
//   console.log("\nSERVER: SellToken Event received POST");
//   res.sendStatus(200);
// });

// app.delete(`/SellToken/`, (req, res) => {
//   console.log("\nSERVER: RemoveToken Event received POST");
//   res.sendStatus(200);
// });

app.listen(PORT, async () => {
  console.log(`\nSERVER: Server running on http://localhost:${PORT}`);

  // TODO: test Get last blocknumber from cache PAU!
  if (status) {
    let response = await axios.get(`${API_URL}blockchain/blocknumber`, {
      headers: {
        Authorization: API_BEARER_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (response.blockNumber == 0) {
      fromBlockNumber == process.env.BLOCK_NUMBER;
    } else {
      fromBlockNumber = response.data.blockNumber;
    }
    // console.log(response);
    console.log(fromBlockNumber);
  }

  // G4AL Events (testnet)
  status = Sync.ListenerMarketPlaceSelltoken(fromBlockNumber, status); // Sync
  status = Listeners.ListenerMarketPlaceSelltoken(status); // List new events

  status = Sync.ListenerMarketPlaceBuyToken(fromBlockNumber, status); // Sync past events
  status = Listeners.ListenerMarketPlaceBuyToken(status); // List new events

  status = Sync.ListenerMarketPlaceRemoveToken(fromBlockNumber, status); // Syn past events
  status = Listeners.ListenerMarketPlaceRemoveToken(status); // List new events

  status = Sync.ListenerSkillTransfer(fromBlockNumber, status); // Sync past events
  status = Listeners.ListenerSkillTransfer(status); // List new events

  status = Sync.ListenerSkinTransfer(fromBlockNumber, status); // Sync past events
  status = Listeners.ListenerSkinTransfer(status); // List new events

  status = Sync.ListenerERC1155MockUpTransferSingle(fromBlockNumber, status); // Sync past events
  status = Listeners.ListenerERC1155MockUpTransferSingle(status); // List new events

  status = Sync.ListenerERC1155MockUpTransferBatch(fromBlockNumber, status); // Sync past events
  status = Listeners.ListenerERC1155MockUpTransferBatch(status); // List new events
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
