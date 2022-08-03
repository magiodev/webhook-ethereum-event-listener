const ApiCalls = require("./utils/ApiCalls");
const Contract = require("./utils/Contract");

// Web3 Provider
const Web3 = require('web3')
const Provider = new Web3(new Web3.providers.WebsocketProvider(process.env.PROVIDER_URL))

const YourContract = new Provider.eth.Contract(
  Contract.getABI('YourContract'),
  Contract.getAddress('YourContract')
)

// States
const blocksOffset = process.env.APP_BLOCKS_OFFSET
const iterationLimit = process.env.APP_ITERATION_LIMIT
let fromBlock // setting as null because the whole script can't be async and the getBlockNumber() method is
let toBlock
let iterationCurrent = 0
let repeat = false

let parsedTxs = []

const Sync = {
  // -- Events -- //

  async syncPastEvents(resetSyncCounter) {
    //fromInterval true when called by app.js interval, only first time
    if (resetSyncCounter) {
      fromBlock = null
      iterationCurrent = 0
    }
    // incrementCurrent for old cycle or new one
    iterationCurrent++
    // set repeat false again in order to evaluate freshly during this iteration
    repeat = false
    // iteration workflow
    if (iterationCurrent <= iterationLimit) {
      // If NOT the first time we subtract blocksOffset from toBlock (as it is null first time)
      if (fromBlock) {
        toBlock = (toBlock - blocksOffset)
      }
      // If the first time we ask for current blockNumber() and set toBlock and fromBlock
      if (!fromBlock) {
        toBlock = Number(await Provider.eth.getBlockNumber())
        fromBlock = toBlock
      }
      fromBlock = (fromBlock - blocksOffset)

      // Events found
      const events = [
        await this.pastEventsYourEvent(),
        // ...more as you need
      ]

      // Running again if something POSTed or found events number is 0
      if (repeat || !this.getEventsFoundNumber(events)) {
        console.log('Repeating sync process with ' + blocksOffset + ' blocks less!')
        await this.syncPastEvents()
      }
    }
  },

  getEventsFoundNumber(events) {
    let count = 0
    for (let event of events) {
      if (event.length) {
        count = count + event.length
      }
    }
    return count
  },

  async pastEventsYourEvent() {
    let results
    await YourContract.getPastEvents('YourEvent', {
      filter: {},
      fromBlock: String(fromBlock),
      toBlock: String(toBlock)
    }, function (error, events) {
      results = events
    })
      .then(async function (events) {
        if (events.length) {
          console.log('Found ' + events.length + ' past YourEvent')

          for (let event of events) {
            if (!parsedTxs.includes(event.transactionHash)) {
              repeat = await ApiCalls.postSomething(event)
              parsedTxs.push(event.transactionHash)
            } else {
              console.log('Tx '+event.transactionHash+' already parsed')
            }
          }
        }
      });
    return results
  }
}

module.exports = Sync
