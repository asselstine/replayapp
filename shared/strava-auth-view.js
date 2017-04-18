import { WebView, Component } from 'react-native'

export class StravaAuthView extends Component {
  url () {
    // let url = 'https://www.strava.com/oauth/authorize'
    // url += '?request_type=code&'
  }
  render () {
    return (
      <WebView
        source={this.url()} />
    )
  }
}
