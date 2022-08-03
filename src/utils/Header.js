const Header = {

  types: {
    AUTHORIZATION: 'Authorization',
  },

  values: {
    BEARER: 'Bearer '
  },

  /**
   * @param token
   * @returns {string}
   */
  getTokenValue(token) {
    return Header.values.BEARER + token
  }
}

module.exports = Header
