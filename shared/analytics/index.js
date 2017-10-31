import Config from 'react-native-config'
import Analytics from 'analytics-react-native'
import analyticsUser from './user'
const analytics = new Analytics(Config.SEGMENT_WRITE_KEY)

export default analytics

export const track = function (options) {
  analytics.track(analyticsUser(options))
}

export const screen = function (options) {
  analytics.screen(analyticsUser(options))
}
