import Config from 'react-native-config'
import Analytics from 'analytics-react-native'
export default new Analytics(Config.SEGMENT_WRITE_KEY)
