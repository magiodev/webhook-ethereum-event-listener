const ApiCalls = require('./api/ApiCalls')
const Contract = require('./utils/Contract')
const provider = require('./utils/Provider')
const emitter = require('events')

const GFALMarketplace = new provider.web3.eth.Contract(
  Contract.getABI('GFALMarketplace'),
  Contract.getAddress('GFALMarketplace')
)

const Listener = {
  // -- Events -- //
  async eventListenerSellToken() {
    return await GFALMarketplace.events.SellToken()
      .on('connected', function (subscriptionId) {
        console.log(`Setting the SellToken hook: ${subscriptionId}`)
      })
      .on('data', async function (event) {
        console.log(`Hook has detected a new SellToken!: ${event.returnValues}`)
        // find corresponding offer
        try {
          await ApiCalls.postListing(event)
        } catch (error) {
          console.log(error)
        }
      })
      .on('error', function (error) {
        console.log(error)
        emitter.emit('listener-error', error)
      })
  },

  async eventListenerRemoveToken() {
    return await GFALMarketplace.events.RemoveToken()
      .on('connected', function (subscriptionId) {
        console.log(`Setting the RemoveToken hook: ${subscriptionId}`)
      })
      .on('data', async function (event) {
        console.log(`Hook has detected a new RemoveToken!: ${event.returnValues}`)
        // find corresponding offer
        try {
          await ApiCalls.deleteListing(event)
        } catch (error) {
          console.log(error)
        }
      })
      .on('error', function (error) {
        console.log(error)
        emitter.emit('listener-error', error)
      })
  },

  async eventListenerBuyToken() {
    return await GFALMarketplace.events.BuyToken()
      .on('connected', function (subscriptionId) {
        console.log(`Setting the BuyToken hook: ${subscriptionId}`)
      })
      .on('data', async function (event) {
        console.log(`Hook has detected a new BuyToken!: ${event.returnValues}`)
        // find corresponding offer
        try {
          await ApiCalls.postOrder(event)
        } catch (error) {
          console.log(error)
        }
      })
      .on('error', function (error) {
        console.log(error)
        emitter.emit('listener-error', error)
      })
  }
}

module.exports = Listener
