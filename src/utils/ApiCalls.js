const Something = require("../api/Something");
const ApiCalls = {
  // -- Utils and reusable methods -- //

  async postSomething(event) {
    console.log('Posting new Something with values: ' + event.returnValues)
    let repeat = false
    await Something.postSomething(event.returnValues)
      .then(() => {
        repeat = true // repeating as maybe you need to fetch something oldest
        console.log('You posted something!')
      })
      .catch(e => {
        console.log('Something went wrong.')
        console.log(e)
      })
    return repeat
  }
}

module.exports = ApiCalls
