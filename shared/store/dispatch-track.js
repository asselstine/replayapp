import { store } from '.'
import { track } from '../analytics'

export default function (action, trackingProperties) {
  store.dispatch(action)
  track({
    event: action.type,
    properties: trackingProperties
  })
}
