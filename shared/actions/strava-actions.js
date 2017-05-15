export const login = function (stravaData) {
  return {
    type: 'STRAVA_LOGIN',
    data: stravaData
  }
}
