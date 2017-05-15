import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Video from 'react-native-video'
import {
  View,
  TouchableOpacity
} from 'react-native'

export class VideoPlayer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      paused: true,
      duration: 0,
      orientation: 'landscape',
      width: 1,
      height: 1
    }
    this.onLoad = this.onLoad.bind(this)
    this.onPressVideo = this.onPressVideo.bind(this)
  }

  onLoad (e) {
    this.setState({
      duration: e.duration,
      orientation: e.naturalSize.orientation,
      width: e.naturalSize.width,
      height: e.naturalSize.height
    })
  }

  onPressVideo (e) {
    if (this.state.paused) {
      this.player.seek(0)
    }
    this.setState({ paused: !this.state.paused })
  }

  render () {
    let aspectRatio = (this.state.width * 1.0) / this.state.height
    let videoStyle = {
      width: '100%',
      aspectRatio: aspectRatio,
      maxHeight: 200
    }

    return (
      <TouchableOpacity onPress={this.onPressVideo}>
        <Video
          source={this.props.video}
          onLoadStart={this.onLoadStart}
          onLoad={this.onLoad}
          ref={(ref) => { this.player = ref }}
          paused={this.state.paused}
          style={videoStyle}
          resizeMode='fill'
          />
      </TouchableOpacity>
    )
  }
}

VideoPlayer.propTypes = {
  video: PropTypes.object.isRequired
}
