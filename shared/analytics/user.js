import { store } from '../store'

export default function (params = {}) {
  var athlete = store.getState().athletes.data
  if (athlete) {
    params.userId = athlete.id
  } else {
    params.anonymousId = store.getState().athletes.anonymousId
  }
  return params
}
