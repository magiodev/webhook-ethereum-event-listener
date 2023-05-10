require("dotenv").config();
const ethers = require("ethers");
const axios = require("axios");
const Contract = require("./utils/Contract");
const { myprog } = require("../MailGun/sendInfoMail");
const {provider} = require("./utils/Provider");

// URL to POST events
const endPointPostEvents = process.env.API_URL;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN;

// // Instance provider
// const provider = new ethers.providers.JsonRpcProvider(
//   `${process.env.PROVIDER_TESTNET_HTTPS}`
// );

// Instance Smart Contracts
const marketPlaceSC = new ethers.Contract(
  process.env.MARKETPLACE_ADDRESS,
  Contract.getABI("marketplace"),
  provider
);

const Listeners = {
  // Marketplace Smart contract
  async ListenerMarketPlaceSelltoken() {
    marketPlaceSC.on(
      "SellToken",
      async (collection, tokenId, amount, price, isDollar, seller, event) => {
        let { transactionHash, blockNumber } = event;
        let priceHex = price._hex;
        let priceDecimals = parseInt(priceHex, 16);
        let { _hex } = amount;
        let amountDecimals = parseInt(_hex, 16);
        let tokenIdDecimals = parseInt(tokenId._hex, 16);

        let eventData = {
          data: {
            eventName: "SellToken",
            contract: collection,
            tokenId: tokenIdDecimals,
            amount: amountDecimals,
            price: priceDecimals.toString(),
            isDollar: isDollar,
            seller: seller,
            transactionHash: transactionHash,
            blockNumber: blockNumber,
          },
        };

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
            console.log("You posted a SellToken!");
          } else {
            console.log(
              "Failed to post SellToken. Status code:",
              response.status
            );
          }
          return true;
        } catch (error) {
          console.error("Error posting event data:", error);
          let data = {
            from: "gamesforaliving@g4al.com",
            to: "cricharte@g4al.com",
            subject: "(New event) SellToken Error",
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
    );
  },
  async ListenerMarketPlaceBuyToken() {
    marketPlaceSC.on(
      "BuyToken",
      async (
        collection,
        tokenId,
        amount,
        price,
        sellerRevenue,
        royalties,
        seller,
        buyer,
        event
      ) => {
        let { transactionHash, blockNumber } = event;
        let priceHex = price._hex;
        let priceDecimals = parseInt(priceHex, 16);
        let { _hex } = amount;
        let amountDecimals = parseInt(_hex, 16);
        let tokenIdDecimals = parseInt(tokenId._hex, 16);
        let royaltiesDecimals = parseInt(royalties._hex, 16);
        let sellerRevenueDecimals = parseInt(sellerRevenue._hex, 16);
        let eventData = {
          data: {
            eventName: "BuyToken",
            contract: collection,
            tokenId: tokenIdDecimals,
            amount: amountDecimals,
            price: priceDecimals.toString(),
            sellerRevenue: sellerRevenueDecimals,
            royalties: royaltiesDecimals,
            seller: seller,
            buyer: buyer,
            transactionHash: transactionHash,
            blockNumber: blockNumber,
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
            console.log("You posted a BuyToken!");
          } else {
            console.log(
              "Failed to post BuyToken. Status code:",
              response.status
            );
          }
          return true;
        } catch (error) {
          console.error("Error posting event data:", error);
          let data = {
            from: "gamesforaliving@g4al.com",
            to: "cricharte@g4al.com",
            subject: "(New event) BuyToken Error",
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
    );
  },
  async ListenerMarketPlaceRemoveToken() {
    marketPlaceSC.on(
      "RemoveToken",
      async (collection, tokenId, seller, event) => {
        let { transactionHash, blockNumber } = event;
        let tokenIdDecimals = parseInt(tokenId._hex, 16);
        let eventData = {
          eventName: "RemoveToken",
          collection: collection,
          tokenId: tokenIdDecimals,
          seller: seller,
          transactionHash: transactionHash,
          blockNumber: blockNumber,
        };

        try {
          let response = await axios.delete(
            `${endPointPostEvents}/listings?contract=${eventData.collection}&tokenId=${eventData.tokenId}&seller=${eventData.seller}`,
            {
              headers: {
                Authorization: API_BEARER_TOKEN,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status === 200) {
            console.log("You posted a RemoveToken!");
          } else {
            console.log(
              "Failed to post RemoveToken. Status code:",
              response.status
            );
          }
          return true;
        } catch (error) {
          console.error("Error posting event data:", error);
          let data = {
            from: "gamesforaliving@g4al.com",
            to: "cricharte@g4al.com",
            subject: "(New event) RemoveToken Error",
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
    );
  },
};

module.exports = { Listeners };
