export default {
  reset: function () {
    return {
      type: 'RESET_CACHE'
    }
  },

  set: function (key) {
    return {
      type: 'SET_CACHE_KEY',
      key: key
    }
  },

  resetMatch: function (keyMatch) {
    return {
      type: 'RESET_CACHE_MATCH',
      keyMatch: keyMatch,
    }
  }
}
