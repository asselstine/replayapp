export const login = function (stravaData) {
  return {
    type: 'STRAVA_LOGIN',
    data: stravaData
  }
}

export const logout = function () {
  return {
    type: 'STRAVA_LOGOUT',
  }
}
