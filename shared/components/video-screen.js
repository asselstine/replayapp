import React, {
  Component
} from 'react'
import { VideoView } from './video-view'
import { Provider } from 'react-redux'
import { store } from '../store'

export class VideoScreen extends Component {
  constructor (props) {
    super(props)
    this.onStravaConnected = this.onStravaConnected.bind(this)
  }

  onStravaConnected () {
    console.log('navigating to StravaActivitySelect')
    this.props.navigation.navigate('StravaActivitySelect')
  }

  render () {
    const { params } = this.props.navigation.state
    return (
      <Provider store={store}>
        <VideoView
          rawVideoData={params.rawVideoData}
          onStravaConnected={this.onStravaConnected} />
      </Provider>
    )
  }
}
