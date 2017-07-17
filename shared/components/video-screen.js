import React, {
  Component
} from 'react'
import { VideoView } from './video-view'
import { Provider } from 'react-redux'
import { store } from '../store'

export class VideoScreen extends Component {
  render () {
    const { params } = this.props.navigation.state
    return (
      <Provider store={store}>
        <VideoView
          videoUri={params.videoUri} />
      </Provider>
    )
  }
}
