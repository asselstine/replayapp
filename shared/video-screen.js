import React, {
  Component
} from 'react'
import { VideoView } from './video-view'

export class VideoScreen extends Component {
  render () {
    const { params } = this.props.navigation.state
    return (
      <VideoView video={params.video} />
    )
  }
}
