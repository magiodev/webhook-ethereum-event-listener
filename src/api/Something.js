const Ajax = require('./Ajax')

const Something = {
  postSomething: (params) => {
    return Ajax.post('/something', params)
  },
}

module.exports = Something
