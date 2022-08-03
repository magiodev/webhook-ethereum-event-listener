const Contract = require("./utils/Contract");
const ApiCalls = require("./utils/ApiCalls");

// Web3 Provider
const Web3 = require('web3')
const Provider = new Web3(new Web3.providers.WebsocketProvider(process.env.PROVIDER_URL))

const YourContract = new Provider.eth.Contract(
  Contract.getABI('YourContract'),
  Contract.getAddress('YourContract')
)

/*
 * Class
 */
const Listener = {
  // -- Events -- //
  eventListenerYourEvent() {
    return YourContract.events.YourEvent()
      .on('connected', function (subscriptionId) {
        console.log('Setting the YourEvent hook: ' + subscriptionId)
      })
      .on('data', async function (event) {
        console.log('Hook has detected a new YourEvent!: ' + event.returnValues)
        // find corresponding offer
        await ApiCalls.postSomething(event)
      })
      .on('error', function (error) {
        console.log(error);
      });
  }
}

module.exports = Listener
