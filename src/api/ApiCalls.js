
const Ajax = require("./Ajax");

const ApiCalls = {
  /*
   * @notice Used to both create and update listings
   */
  async postListing(event) {
    console.log('Posting new Listing with values: ' + event.returnValues)
    let repeat = false
    Ajax.post('/listings', event.returnValues)
      .then(() => {
        repeat = true // repeating as maybe you need to fetch something oldest
        console.log('You posted a listing!')
      })
      .catch(e => {
        console.log('Something went wrong posting a listing.', event.returnValues)
        console.log(e)
      })
    return repeat
  },

  /*
   * @notice Used to both create and update listings
   */
  async deleteListing(event) {
    console.log('Posting new Listing with values: ' + event.returnValues)
    let repeat = false
    Ajax.delete('/listings', event.returnValues)
      .then(() => {
        repeat = true // repeating as maybe you need to fetch something oldest
        console.log('You posted a listing!')
      })
      .catch(e => {
        console.log('Something went wrong posting a listing.', event.returnValues)
        console.log(e)
      })
    return repeat
  },

  /*
   * @notice Used to create orders that have been already executed and are not revertible
   */
  async postOrder(event) {
    console.log('Posting new Order with values: ' + event.returnValues)
    let repeat = false
    Ajax.post('/orders', event.returnValues)
      .then(() => {
        repeat = true // repeating as maybe you need to fetch something oldest
        console.log('You posted a order!')
      })
      .catch(e => {
        console.log('Something went wrong posting an order.', event.returnValues)
        console.log(e)
      })
    return repeat
  }
}

module.exports = ApiCalls
