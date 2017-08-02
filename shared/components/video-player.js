import React, { Component } from 'react'
import PropTypes from 'prop-types'
import update from 'immutability-helper'
import Video from 'react-native-video'
import TimerMixin from 'react-timer-mixin'
import reactMixin from 'react-mixin'
import _ from 'lodash'
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  View
} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

export class VideoPlayer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      paused: true,
      duration: 0,
      orientation: 'landscape',
      width: 1,
      height: 1,
      overlayOpacity: new Animated.Value(0),
      showOverlay: false
    }
    this.onLoad = this.onLoad.bind(this)
    this.onPressVideo = this.onPressVideo.bind(this)
    this.hideOverlay = this.hideOverlay.bind(this)
  }

  onLoad (e) {
    this.setState({
      duration: e.duration,
      orientation: e.naturalSize.orientation,
      width: e.naturalSize.width,
      height: e.naturalSize.height
    })
  }

  showOverlay () {
    Animated.timing(
      this.state.overlayOpacity,
      {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }
    ).start()
    this.setState({ showOverlay: true })
  }

  hideOverlay () {
    Animated.timing(
      this.state.overlayOpacity,
      {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      }
    ).start()
    this.setState({ showOverlay: false })
  }

  beginOverlayTimeout () {
    if (this.timeout) {
      this.clearTimeout(this.timeout)
    }
    this.timeout = this.setTimeout(this.hideOverlay, 3000)
  }

  onPressVideo (e) {
    // if (!this.state.showOverlay) {
    //   this.showOverlay()
    //   this.beginOverlayTimeout()
    // } else {
    //   this.hideOverlay()
    // }
    this.togglePlay()
  }

  togglePlay () {
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
    let videoStyle = update({
      width: '100%',
      aspectRatio: aspectRatio
    }, { $merge: this.props.style })

    var overlayStyle = _.merge({}, styles.overlay, {
      opacity: this.state.overlayOpacity
    })

    /*
    <View>
    <Animated.View style={overlayStyle}>
      <MaterialIcon name='keyboard-arrow-down' size={30} color='red' />
    </Animated.View>
    </View>
    */

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
          resizeMode='cover'
          />
      </TouchableOpacity>
    )
  }
}

VideoPlayer.propTypes = {
  video: PropTypes.object.isRequired,
  onProgress: PropTypes.func,
  onPlay: PropTypes.func,
  style: PropTypes.object
}

VideoPlayer.defaultProps = {
  style: {}
}

const styles = {
  overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  }
}

reactMixin(VideoPlayer.prototype, TimerMixin)
