export const helpSeen = function (key) {
  return {
    type: 'HELP_SEEN',
    key: key
  }
}

export const resetHelp = function () {
  return {
    type: 'RESET_HELP'
  }
}
