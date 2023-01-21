import ApiCalls from './api/ApiCalls'
import Contract from './utils/Contract'
import provider from './utils/Provider'

const YourContract = new provider.web3.eth.Contract(
  Contract.getABI('YourContract'),
  Contract.getAddress('YourContract')
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
      const events = await pastEvents(eventName, fromBlock, toBlock)
      repeat = await postEvents(events)
    }
  }

  async function pastEvents(eventName, fromBlock, toBlock) {
    try {
      return await YourContract.getPastEvents(eventName, {
        filter: {},
        fromBlock: String(fromBlock),
        toBlock: String(toBlock)
      })
    } catch (error) {
      console.error(error)
    }
  }

  async function postEvents(events) {
    if (events.length) {
      for (const event of events) {
        if (!parsedTxs.has(event.transactionHash)) {
          parsedTxs.add(event.transactionHash)
          const repeat = await ApiCalls.postSomething(event)
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
