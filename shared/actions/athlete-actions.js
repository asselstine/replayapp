export const receiveCurrentAthlete = function (json) {
  return {
    type: 'RECEIVE_CURRENT_ATHLETE',
    data: json
  }
}
