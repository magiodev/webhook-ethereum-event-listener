const axios = require('axios')
const Header = require('../utils/Header')

/*
 * MAIN Method called by below parent methods, called by subClasses. Here we set Headers and common Requests stuffs.
 */
const ajaxRequest = (config) => {
  config.baseURL = process.env.API_URL
  config.headers = {}
  if (process.env.API_BEARER_TOKEN) {
    config.headers[Header.types.AUTHORIZATION] = Header.getTokenValue(process.env.API_BEARER_TOKEN)
  }

  return axios.request(config).then(response => {
    return response.data
  })
}

/*
 * Parent methods call from subClasses
 */
const Ajax = {
  get: (endpoint, config = {}) => {
    config = {
      ...config,
      ...{
        url: endpoint,
        method: 'GET'
      }
    }

    return ajaxRequest(config)
  },

  post: (endpoint, params, config = {}) => {
    config = {
      ...config,
      ...{
        url: endpoint,
        method: 'POST',
        data: params
      }
    }

    return ajaxRequest(config)
  },

  put: (endpoint, params, config = {}) => {
    config = {
      ...config,
      ...{
        url: endpoint,
        method: 'PUT',
        data: params
      }
    }

    return ajaxRequest(config)
  },

  delete: (endpoint, params = null, config = {}) => {
    config = {
      ...config,
      ...{
        url: endpoint,
        method: 'DELETE'
      }
    }

    if (params) {
      config.data = {data: params}
    }

    return ajaxRequest(config)
  }
}

module.exports = Ajax
