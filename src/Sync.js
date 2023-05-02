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
          price: parseInt(priceHex, 16),
          isDollar: events[i].args[4],
          seller: events[i].args[5],
          transactionHash: events[i].transactionHash,
          blockNumber: events[i].blockNumber,
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
          price: parseInt(priceHex, 16),
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
            `${endPointPostEvents}listings?contract=${eventData.collection}&tokenId=${eventData.tokenId}&seller=${eventData.seller}`,
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
  // Skill Smart contract (Remove Token from listing if transferred)
  async ListenerSkillTransfer(fromBlockNumber) {
    const actualBlockNumber = (await provider.getBlockNumber()) - 1;

    let events = await skillSC.queryFilter(
      "Transfer",
      fromBlockNumber - actualBlockNumber,
      actualBlockNumber - 1
    );

    // Check if each token ID transferred found is on sale
    for (let i = 0; i < events.length; i++) {
      let tokenIdHex = events[i].args[2];

      let Sale = await marketPlaceSC.tokensForSale721(
        skillSC.address, //SC address
        parseInt(tokenIdHex, 16) // From tokenID
      );

      // Check if the transfer is because of minting a new token (Sender is 0x)
      if (events[i].args[0] !== "0x0000000000000000000000000000000000000000") {
        console.log("Transfer found in Skill!");

        // Check if the amount is 0 (It means there is not any token on sale)
        if (Sale.amount._hex !== "0x00") {
          try {
            console.log(`\nSkill Token transfer found in Sale! Removing.. `);
            await marketPlaceSC
              .connect(signer)
              .removeToken(
                events[i].address,
                events[i].args[0],
                parseInt(tokenIdHex, 16)
              );
            if (i === events.length - 1) {
              return true;
            }
          } catch (error) {
            console.error(
              `Error Removing Skill Token from Sale after listening "Transfer: "`,
              error
            );
            let data = {
              from: "gamesforaliving@g4al.com",
              to: "cricharte@g4al.com",
              subject: `(Synced Event) Error Removing Token from Sale after listening Skill - "Transfer Event"`,
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
  },
  // Skin Smart contract (Remove Token from listing if transferred)
  async ListenerSkinTransfer(fromBlockNumber) {
    const actualBlockNumber = (await provider.getBlockNumber()) - 1;

    let events = await skinSC.queryFilter(
      "Transfer",
      fromBlockNumber - actualBlockNumber,
      actualBlockNumber - 1
    );

    // Check if each token ID transferred found is on sale
    for (let i = 0; i < events.length; i++) {
      let tokenIdHex = events[i].args[2];

      let Sale = await marketPlaceSC.tokensForSale721(
        skinSC.address, //SC address
        parseInt(tokenIdHex, 16) // From tokenID
      );

      // Check if the transfer is because of minting a new token (Sender is 0x)
      if (events[i].args[0] !== "0x0000000000000000000000000000000000000000") {
        console.log("Transfer found in Skin!");

        // Check if the amount is 0 (It means there is not any token on sale)
        if (Sale.amount._hex !== "0x00") {
          try {
            console.log(`\nSkin Token transfer found in Sale! Removing.. `);

            await marketPlaceSC
              .connect(signer)
              .removeToken(
                events[i].address,
                events[i].args[0],
                parseInt(tokenIdHex, 16)
              );

            console.log("Token removed from sale!");
            if (i === events.length - 1) {
              return true;
            }
          } catch (error) {
            console.error(
              `- Error Removing Skin Token from Sale after listening "Transfer: "`,
              error
            );
            let data = {
              from: "gamesforaliving@g4al.com",
              to: "cricharte@g4al.com",
              subject: `(Synced Event) Error Removing Token from Sale after listening Skin - "Transfer Event"`,
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
  },
  // ERC1155 MockUp Smart contract (Remove Token from listing if transferred)
  async ListenerERC1155MockUpTransferSingle(fromBlockNumber) {
    const actualBlockNumber = (await provider.getBlockNumber()) - 1;

    let events = await erc1155MockUp.queryFilter(
      "TransferSingle",
      fromBlockNumber - actualBlockNumber,
      actualBlockNumber - 1
    );

    // Transactions not filtered and containing duplicates
    let transactions = [];

    for (let i = 0; i < events.length; i++) {
      let tokenIdHex = events[i].args[3];

      let transaction = {
        id: parseInt(tokenIdHex, 16),
        from: events[i].args[1],
        blockNumber: events[i].blockNumber,
      };
      transactions.push(transaction);
    }

    // Group transactions by seller and ID
    let groupedTransactions = transactions.reduce((acc, cur) => {
      let key = `${cur.seller}:${cur.id}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(cur);
      return acc;
    }, {});

    // Find the seller, ID, and highest block number for each group
    let highestBlockTransactions = await Promise.all(
      Object.values(groupedTransactions).map((group) => {
        highestBlockTransaction = group.reduce((acc, cur) => {
          return cur.blockNumber > acc.blockNumber ? cur : acc;
        }, group[0]);
        return highestBlockTransaction;
      })
    );

    for (let i = 0; i < highestBlockTransactions.length; i++) {
      let idDecimals = highestBlockTransactions[i].id;
      let from = highestBlockTransactions[i].from;

      let Sale = await marketPlaceSC.tokensForSale1155(
        erc1155MockUp.address, //SC address
        idDecimals, // From tokenID
        from // Seller
      );

      // Check if the transfer is because of minting a new token (Sender is 0x)
      if (from !== "0x0000000000000000000000000000000000000000") {
        console.log("Transfer found in erc1155MockUp!");

        // Check if the amount is 0 (It means there is not any token on sale)
        if (
          Sale.amount._hex !== "0x00" &&
          (await erc1155MockUp.balanceOf(from, idDecimals)) < Sale.amount
        ) {
          try {
            console.log(`\nERC1155 Tokens transfer found in Sale! Removing.. `);

            await marketPlaceSC
              .connect(signer)
              .removeToken(erc1155MockUp.address, from, idDecimals);

            console.log("Tokens removed from sale!");
            if (i === highestBlockTransactions.length - 1) {
              return true;
            }
          } catch (error) {
            console.error(
              `- Error Removing ERC1155MockUp Token from Sale after listening "TransferSingle: "`,
              error
            );
            let data = {
              from: "gamesforaliving@g4al.com",
              to: "cricharte@g4al.com",
              subject: `(Synced Event) Error Removing Token from Sale after listening ERC1155MockUp - "TransferSingle Event"`,
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
  },
  // ERC1155 MockUp Smart contract (Remove Token from listing if batch transferred)
  async ListenerERC1155MockUpTransferBatch(fromBlockNumber) {
    const actualBlockNumber = (await provider.getBlockNumber()) - 1;

    // It will iterate through all the blocks getting the transactions
    let events = await erc1155MockUp.queryFilter(
      "TransferBatch",
      fromBlockNumber - actualBlockNumber,
      actualBlockNumber
    );

    // Transactions not filtered and containing duplicates
    let transactions = [];

    for (let i = 0; i < events.length; i++) {
      let tokenIdHex = events[i].args[3];

      let transaction = {
        id: tokenIdHex,
        seller: events[i].args[1],
      };
      transactions.push(transaction);
    }

    let sellerIds = transactions.reduce((acc, transaction) => {
      let { id, seller } = transaction;
      if (!acc[seller]) {
        // create a new entry for the seller if it doesn't exist
        acc[seller] = new Set(id);
      } else {
        // add new unique ids to the existing entry for the seller
        id.forEach((i) => acc[seller].add(i));
      }
      return acc;
    }, {});
    // convert the sets to arrays
    let sellerIdsArray = {};
    for (let seller in sellerIds) {
      sellerIdsArray[seller] = Array.from(sellerIds[seller]);
    }

    for (const seller in sellerIdsArray) {
      const values = sellerIdsArray[seller];
      const uniqueValues = new Set();

      for (const value of values) {
        const decValue = parseInt(value._hex, 16);
        if (!uniqueValues.has(decValue)) {
          uniqueValues.add(decValue);
        }
      }

      sellerIdsArray[seller] = [...uniqueValues];
    }

    for (let seller in sellerIdsArray) {
      let ids = sellerIdsArray[seller];
      for (let [i, idObj] of ids.entries()) {
        let idDecimal = idObj;
        let Sale = await marketPlaceSC.tokensForSale1155(
          erc1155MockUp.address, //SC address
          idDecimal, // tokenId
          seller
        );

        // Check if the transfer is because of minting a new token (Sender is 0x)
        if (seller !== "0x0000000000000000000000000000000000000000") {
          // Check if the amount is 0 (It means there is not any token on sale)
          if (parseInt(Sale.amount._hex, 16) !== "0x00") {
            // Check if the amount in balance is less than the amount on sale
            if (
              (await erc1155MockUp.balanceOf(seller, idDecimal)) <
              parseInt(Sale.amount._hex, 16)
            ) {
              try {
                console.log(
                  `Transferred erc1155MockUp token ${idDecimal} found in Sale!`
                );
                await marketPlaceSC
                  .connect(signer)
                  .removeToken(erc1155MockUp.address, seller, idDecimal);
                console.log(`Token ${idDecimal} removed from sale!`);
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
  },
};
module.exports = { Sync };
