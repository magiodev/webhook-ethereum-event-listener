require("dotenv").config();
const ethers = require("ethers");
const axios = require("axios");
const Contract = require("./utils/Contract");
const { myprog } = require("../MailGun/sendInfoMail");

// URL to POST events
const endPointPostEvents = process.env.API_URL;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN;

// Instance provider
const provider = new ethers.providers.JsonRpcProvider(
  `${process.env.PROVIDER_TESTNET_HTTPS}`
);

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

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
            price: priceDecimals,
            isDollar: isDollar,
            seller: seller,
            transactionHash: transactionHash,
            blockNumber: blockNumber,
          },
        };

        try {
          let response = await axios.post(
            `${endPointPostEvents}listings`,
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
            price: priceDecimals,
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
            `${endPointPostEvents}orders`,
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
            `${endPointPostEvents}listings?contract=${eventData.collection}&tokenId=${eventData.tokenId}&seller=${eventData.seller}`,
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
  // Skill Smart contract (Remove Token from listing if transferred)
  async ListenerSkillTransfer() {
    skillSC.on("Transfer", async (from, to, tokenId, event) => {
      let Sale = await marketPlaceSC.tokensForSale721(
        skillSC.address, //SC address
        parseInt(tokenId, 16) // From tokenID
      );

      // Check if the transfer is because of minting a new token (Sender is 0x)
      if (from !== "0x0000000000000000000000000000000000000000") {
        // Check if the amount is 0 (It means there is not any token on sale)
        if (Sale.amount._hex !== "0x00") {
          try {
            console.log(`Transferred Skill token found in Sale!`);
            await marketPlaceSC
              .connect(signer)
              .removeToken(skillSC.address, from, parseInt(tokenId, 16));
            console.log(`Token ${parseInt(tokenId, 16)} removed from sale!`);
            return true;
          } catch (error) {
            console.error(
              `Error Removing Token from Sale after listening "Transfer: "`,
              error
            );
            let data = {
              from: "gamesforaliving@g4al.com",
              to: "cricharte@g4al.com",
              subject: `(New event) Error Removing Token from Sale after listening Skill - "Transfer Event"`,
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
    });
  },
  // Skin Smart contract (Remove Token from listing if transferred)
  async ListenerSkinTransfer() {
    skinSC.on("Transfer", async (from, to, tokenId, event) => {
      let Sale = await marketPlaceSC.tokensForSale721(
        skinSC.address, //SC address
        parseInt(tokenId, 16) // From tokenID
      );

      // Check if the transfer is because of minting a new token (Sender is 0x)
      if (from !== "0x0000000000000000000000000000000000000000") {
        // Check if the amount is 0 (It means there is not any token on sale)
        if (Sale.amount._hex !== "0x00") {
          try {
            console.log(`Transferred Skin token found in Sale!`);
            await marketPlaceSC
              .connect(signer)
              .removeToken(skinSC.address, from, parseInt(tokenId, 16));
            console.log(`Token ${parseInt(tokenId, 16)} removed from sale!`);
            return true;
          } catch (error) {
            console.error(
              `Error Removing Token from Sale after listening "Transfer: "`,
              error
            );
            let data = {
              from: "gamesforaliving@g4al.com",
              to: "cricharte@g4al.com",
              subject: `(New event) Error Removing Token from Sale after listening Skin - "Transfer Event"`,
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
    });
  },
  // ERC1155 MockUp Smart contract (Remove Token from listing if transferred)
  async ListenerERC1155MockUpTransferSingle() {
    erc1155MockUp.on(
      "TransferSingle",
      async (operator, from, to, id, amount, event) => {
        let Sale = await marketPlaceSC.tokensForSale1155(
          erc1155MockUp.address, //SC address
          id, // From tokenId
          from
        );

        // Check if the transfer is because of minting a new token (Sender is 0x)
        if (from !== "0x0000000000000000000000000000000000000000") {
          // Check if the amount is 0 (It means there is not any token on sale)
          if (Sale.amount._hex !== "0x00") {
            // Check if the amount in balance is less than the amount on sale
            if ((await erc1155MockUp.balanceOf(from, id)) < Sale.amount) {
              try {
                console.log(`Transferred erc1155MockUp token found in Sale!`);
                await marketPlaceSC
                  .connect(signer)
                  .removeToken(erc1155MockUp.address, from, id);
                console.log(`Token ${id} removed from sale!`);
                return true;
              } catch (error) {
                console.error(
                  `Error Removing Token from Sale after listening "Transfer: "`,
                  error
                );
                let data = {
                  from: "gamesforaliving@g4al.com",
                  to: "cricharte@g4al.com",
                  subject: `(New event) Error Removing Token from Sale after listening erc1155MockUp - "Transfer Event"`,
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
        }
      }
    );
  },
  // ERC1155 MockUp Smart contract (Remove Token from listing if batch transferred)
  async ListenerERC1155MockUpTransferBatch() {
    erc1155MockUp.on(
      "TransferBatch",
      async (operator, from, to, ids, amounts, event) => {
        for (let i = 0; i < ids.length; i++) {
          let idsDecimal = parseInt(ids[i]._hex, 16);
          let Sale = await marketPlaceSC.tokensForSale1155(
            erc1155MockUp.address, //SC address
            idsDecimal, // From tokenId
            from
          );

          // Check if the transfer is because of minting a new token (Sender is 0x)
          if (from !== "0x0000000000000000000000000000000000000000") {
            // Check if the amount is 0 (It means there is not any token on sale)
            if (parseInt(amounts[i]._hex, 16) !== "0x00") {
              // Check if the amount in balance is less than the amount on sale
              if (
                (await erc1155MockUp.balanceOf(from, idsDecimal)) <
                parseInt(Sale.amount._hex, 16)
              ) {
                try {
                  console.log(`Transferred erc1155MockUp token found in Sale!`);
                  await marketPlaceSC
                    .connect(signer)
                    .removeToken(erc1155MockUp.address, from, idsDecimal);
                  console.log(`Token ${ids[i]} removed from sale!`);
                  // Return true only if it is the last iteration, if not it exits when reached
                  if (i === ids.length - 1) {
                    return true;
                  }
                } catch (error) {
                  console.error(
                    `Error Removing Token from Sale after listening "Transfer: "`,
                    error
                  );
                  let data = {
                    from: "gamesforaliving@g4al.com",
                    to: "cricharte@g4al.com",
                    subject: `(New event) Error Removing Token from Sale after listening erc1155MockUp - "Transfer Event"`,
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
          }
        }
      }
    );
  },
};

module.exports = { Listeners };
