const Ajax = require('./Ajax.js')

const Something = {
  postSomething: (params) => {
    return Ajax.post('/something', params)
  },
}

module.exports = Something
