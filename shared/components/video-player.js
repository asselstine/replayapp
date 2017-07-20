import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Video from 'react-native-video'
import {
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
      if (this.getCurrentTime() >= this.state.duration) {
        this.player.seek(0)
        this._onPlay({currentTime: 0})
      } else {
        this._onPlay({currentTime: this.getCurrentTime()})
      }
    }
    this.setState({ paused: !this.state.paused })
  }

  _onPlay (arg) {
    if (this.props.onPlay) {
      this.props.onPlay(arg)
    }
  }

  _onProgress (arg) {
    if (this.props.onProgress) {
      this.props.onProgress(arg)
    }
    this.lastOnProgress = {
      videoTime: arg.currentTime,
      realTime: new Date().valueOf()
    }
  }

  getCurrentTime () {
    if (!this.state.paused) {
      return this.lastOnProgress.videoTime +
        (new Date().valueOf() - this.lastOnProgress.realTime) / 1000.0
    } else if (this.lastOnProgress) {
      return this.lastOnProgress.videoTime
    } else {
      return 0
    }
  }

  seek (time) {
    this.player.seek(time)
  }

  _onEnd (arg) {
    this.setState({ paused: true })
  }

  render () {
    let aspectRatio = (this.state.width * 1.0) / this.state.height
    let videoStyle = {
      width: '100%',
      aspectRatio: aspectRatio
    }

    return (
      <TouchableOpacity onPress={this.onPressVideo}>
        <Video
          source={this.props.video}
          onLoad={this.onLoad}
          ref={(ref) => { this.player = ref }}
          onProgress={(arg) => { this._onProgress(arg) }}
          onEnd={(arg) => { this._onEnd(arg) }}
          paused={this.state.paused}
          style={videoStyle}
          resizeMode='fill'
          />
      </TouchableOpacity>
    )
  }
}

VideoPlayer.propTypes = {
  video: PropTypes.object.isRequired,
  onProgress: PropTypes.func,
  onPlay: PropTypes.func
}
