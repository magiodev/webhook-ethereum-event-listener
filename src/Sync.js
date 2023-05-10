require("dotenv").config();
const ethers = require("ethers");
const axios = require("axios");
const Contract = require("./utils/Contract");
const { provider } = require("./utils/Provider");
const { myprog } = require("../MailGun/sendInfoMail");

// URL to POST events
const endPointPostEvents = process.env.API_URL;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN;

// Instance provider
// const provider = new ethers.providers.JsonRpcProvider(
//   `${process.env.PROVIDER_TESTNET_HTTPS}`
// );

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Instance Smart Contracts
const marketPlaceSC = new ethers.Contract(
  process.env.MARKETPLACE_ADDRESS,
  Contract.getABI("marketplace"),
  provider
);

const Sync = {
  // Marketplace Smart contract
  async ListenerMarketPlaceSelltoken(fromBlockNumber) {
    const actualBlockNumber = (await provider.getBlockNumber()) - 1;

    let events = await marketPlaceSC.queryFilter(
      "SellToken",
      fromBlockNumber - actualBlockNumber,
      actualBlockNumber - 1
    );

    for (let i = 0; i < events.length; i++) {
      let amountHex = events[i].args[2]._hex;
      let priceHex = events[i].args[3]._hex;

      let eventData = {
        data: {
          eventName: events[i].event,
          contract: events[i].args[0],
          tokenId: parseInt(events[i].args[1]._hex, 16),
          amount: parseInt(amountHex, 16),
          price: parseInt(priceHex, 16).toString(),
          isDollar: events[i].args[4],
          seller: events[i].args[5],
          transactionHash: events[i].transactionHash,
          blockNumber: events[i].blockNumber,
        },
      };

      console.log(`PRICE SENT MTHDA: ${eventData.data.price}`);
      console.log(eventData.data);

      try {
        let response = await axios.post(
          `${endPointPostEvents}/listings`,
          eventData,
          {
            headers: {
              Authorization: API_BEARER_TOKEN,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status == "200") {
          console.log("SERVER RESPONSE: You posted a SellToken!");
        } else {
          console.log(
            "Failed to post SellToken. Status code:",
            response.status
          );
        }
        if (i === events.length - 1) {
          return true;
        }
      } catch (error) {
        console.error("Error posting event data:", error);
        let data = {
          from: "gamesforaliving@g4al.com",
          to: "cricharte@g4al.com",
          subject: "(Synced Event) SellToken Error",
          text: `${error}`,
        };
        myprog.sendInfoMail(
          data.subject,
          data.text,
          data.from,
          data.to,
          data.subject
        );
        return false;
      }
    }
  },
  async ListenerMarketPlaceBuyToken(fromBlockNumber) {
    const actualBlockNumber = (await provider.getBlockNumber()) - 1;

    let events = await marketPlaceSC.queryFilter(
      "BuyToken",
      fromBlockNumber - actualBlockNumber,
      actualBlockNumber - 1
    );
    for (let i = 0; i < events.length; i++) {
      let tokenIdHex = events[i].args[1]._hex;
      let amountHex = events[i].args[2]._hex;
      let priceHex = events[i].args[3]._hex;
      let revenueHex = events[i].args[4]._hex;
      let royaltiesHex = events[i].args[5]._hex;

      let eventData = {
        data: {
          eventName: events[i].event,
          contract: events[i].args[0],
          tokenId: parseInt(tokenIdHex, 16),
          amount: parseInt(amountHex, 16),
          price: parseInt(priceHex, 16).toString(),
          sellerRevenue: parseInt(revenueHex, 16),
          royalties: parseInt(royaltiesHex, 16),
          seller: events[i].args[6],
          buyer: events[i].args[7],
          transactionHash: events[i].transactionHash,
          blockNumber: events[i].blockNumber,
        },
      };
      try {
        let response = await axios.post(
          `${endPointPostEvents}/orders`,
          eventData,
          {
            headers: {
              Authorization: API_BEARER_TOKEN,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          console.log("\nYou posted a BuyToken!");
        } else {
          console.log("Failed to post BuyToken. Status code:", response.status);
        }
        if (i === events.length - 1) {
          return true;
        }
      } catch (error) {
        console.error("Error posting event data:", error);
        let data = {
          from: "gamesforaliving@g4al.com",
          to: "cricharte@g4al.com",
          subject: "(Synced Event) BuyToken Error",
          text: `${error}`,
        };
        myprog.sendInfoMail(
          data.subject,
          data.text,
          data.from,
          data.to,
          data.subject
        );

        return false;
      }
    }
  },
  async ListenerMarketPlaceRemoveToken(fromBlockNumber) {
    const actualBlockNumber = (await provider.getBlockNumber()) - 1;

    let events = await marketPlaceSC.queryFilter(
      "RemoveToken",
      fromBlockNumber - actualBlockNumber,
      actualBlockNumber - 1
    );

    for (let i = 0; i < events.length; i++) {
      let tokenIdHex = events[i].args[1]._hex;
      for (let i = 0; i < events.length; i++) {
        let eventData = {
          eventName: events[i].event,
          collection: events[i].args[0],
          tokenId: parseInt(tokenIdHex, 16),
          seller: events[i].args[2],
          transactionHash: events[i].transactionHash,
          blockNumber: events[i].blockNumber,
        };

        try {
          let response = await axios.delete(
            `${endPointPostEvents}/listings?contract=${eventData.collection}&tokenId=${eventData.tokenId}&seller=${eventData.seller}`,
            {
              headers: {
                Authorization: API_BEARER_TOKEN,
              },
            }
          );

          if (response.status === 200) {
            console.log("\nYou posted a RemoveToken!");
          } else {
            console.log(
              "Failed to post RemoveToken. Status code:",
              response.status
            );
          }
          if (i === events.length - 1) {
            return true;
          }
        } catch (error) {
          console.error("Error posting event data:", error);
          let data = {
            from: "gamesforaliving@g4al.com",
            to: "cricharte@g4al.com",
            subject: "(Synced Event) RemoveToken Error",
            text: `${error}`,
          };
          myprog.sendInfoMail(
            data.subject,
            data.text,
            data.from,
            data.to,
            data.subject
          );
          return false;
        }
      }
    }
  },
};

module.exports = { Sync };
