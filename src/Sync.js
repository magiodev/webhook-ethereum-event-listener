const ApiCalls = require('./api/ApiCalls')
const Contract = require('./utils/Contract')
const provider = require('./utils/Provider')

const GFALMarketplace = new provider.web3.eth.Contract(
  Contract.getABI('GFALMarketplace'),
  Contract.getAddress('GFALMarketplace')
)

const blocksOffset = process.env.APP_BLOCKS_OFFSET
const iterationLimit = process.env.APP_ITERATION_LIMIT

let parsedTxs = new Set()

const Sync = (() => {
  async function syncPastEvents(eventName, resetSyncCounter = false) {
    let iterationCurrent = 0
    let repeat = false
    let fromBlock
    let toBlock = await provider.web3.eth.getBlockNumber()

    if (resetSyncCounter) {
      fromBlock = null
      iterationCurrent = 0
    } else {
      fromBlock = toBlock
    }

    while (iterationCurrent <= iterationLimit && !repeat) {
      iterationCurrent++
      fromBlock = fromBlock - blocksOffset
      toBlock = toBlock - blocksOffset

      let events
      try {
        events = await GFALMarketplace.getPastEvents(eventName, {
          filter: {},
          fromBlock: String(fromBlock),
          toBlock: String(toBlock)
        })
      } catch (error) {
        console.error(error)
      }
      repeat = await postEvents(events)
    }
  }

  async function postEvents(events) {
    if (events.length) {
      for (const event of events) {
        if (!parsedTxs.has(event.transactionHash)) {
          parsedTxs.add(event.transactionHash)
          const repeat = await ApiCalls.postSomething(event) // TODO
          if (repeat) {
            return true
          }
        } else {
          console.log(`Transaction hash ${event.transactionHash} already parsed`)
        }
      }
    }
    return false
  }

  return {syncPastEvents}
})()

module.exports = Sync
