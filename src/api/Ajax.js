const Header = require('../utils/Header')

const axios = require('axios')

/*
 * MAIN Method called by below parent methods, called by subClasses. Here we set Headers and common Requests stuffs.
 */
const ajaxRequest = (config) => {
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
        method: 'GET',
        baseURL: config.apiUrl,
        headers: {
          [Header.types.AUTHORIZATION]: Header.getTokenValue(process.env.API_BEARER_TOKEN)
        }
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
        data: params,
        baseURL: config.apiUrl,
        headers: {
          [Header.types.AUTHORIZATION]: Header.getTokenValue(process.env.API_BEARER_TOKEN)
        }
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
        data: params,
        baseURL: config.apiUrl,
        headers: {
          [Header.types.AUTHORIZATION]: Header.getTokenValue(process.env.API_BEARER_TOKEN)
        }
      }
    }

    return ajaxRequest(config)
  },

  delete: (endpoint, params = null, config = {}) => {
    config = {
      ...config,
      ...{
        url: endpoint,
        method: 'DELETE',
        baseURL: config.apiUrl,
        headers: {
          [Header.types.AUTHORIZATION]: Header.getTokenValue(process.env.API_BEARER_TOKEN)
        }
      }
    }
    if (params) {
      config.data = {data: params}
    }
    return ajaxRequest(config)
  }
}

module.exports = Ajax

