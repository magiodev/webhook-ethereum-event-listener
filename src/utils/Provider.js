const Web3 = require('web3')
const provider = new Web3.providers.WebsocketProvider(process.env.PROVIDER_URL)

const web3 = new Web3(provider)

module.exports = {
  web3
}