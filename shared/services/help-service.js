import { store } from '../store'
import {
  helpSeen,
  helpCheck
} from '../actions/help-actions'

export const HelpService = {
  seen (helpKey) {
    store.dispatch(helpSeen(helpKey))
  },

  check (helpKey) {
    store.dispatch(helpCheck(helpKey))
  }
}
