const ApiCalls = require('./api/ApiCalls')
const Contract = require('./utils/Contract')
const provider = require('./utils/Provider')

const emitter = require('events')

const YourContract = new provider.web3.eth.Contract(
  Contract.getABI('YourContract'),
  Contract.getAddress('YourContract')
)

const Listener = {
  // -- Events -- //
  async eventListenerYourEvent() {
    return await YourContract.events.YourEvent()
      .on('connected', function (subscriptionId) {
        console.log(`Setting the YourEvent hook: ${subscriptionId}`)
      })
      .on('data', async function (event) {
        console.log(`Hook has detected a new YourEvent!: ${event.returnValues}`)
        // find corresponding offer
        try {
          await ApiCalls.postSomething(event)
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
