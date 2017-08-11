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
import { Timeline } from './timeline'

export class VideoPlayer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      paused: true,
      duration: 0,
      orientation: 'landscape',
      width: 1,
      height: 1,
      overlayOpacity: new Animated.Value(1),
      showOverlay: true,
      muted: true
    }
    this.onLoad = this.onLoad.bind(this)
    this._onVideoTimeChange = this._onVideoTimeChange.bind(this)
    this.onPressVideo = this.onPressVideo.bind(this)
    this.hideOverlay = this.hideOverlay.bind(this)
    this.togglePlay = this.togglePlay.bind(this)
    this.toggleMute = this.toggleMute.bind(this)
    this.finishHideOverlay = this.finishHideOverlay.bind(this)
    this._onTimeInterval = this._onTimeInterval.bind(this)
    this.onClose = this.onClose.bind(this)
    this._updateLastOnProgress(0)
  }

  onClose (e) {
    if (this.props.onClose) {
      this.props.onClose(e)
    }
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
    ).start(() => { this.finishHideOverlay() })
  }

  finishHideOverlay () {
    this.setState({ showOverlay: false })
  }

  resetOverlayHideTimeout () {
    if (this.timeout) {
      this.clearTimeout(this.timeout)
    }
    this.timeout = this.setTimeout(this.hideOverlay, 3000)
  }

  onPressVideo (e) {
    this.toggleOverlay()
  }

  _onVideoTimeChange (time) {
    this.resetOverlayHideTimeout()
    this.seek(time)
  }

  toggleOverlay () {
    if (!this.state.showOverlay) {
      this.showOverlay()
      this.resetOverlayHideTimeout()
    } else {
      this.hideOverlay()
    }
  }

  toggleMute () {
    this.setState({ muted: !this.state.muted })
    this.resetOverlayHideTimeout()
  }

  togglePlay () {
    if (this.state.paused) {
      if (this.getCurrentTime() >= this.state.duration) {
        this.player.seek(0)
        this._onPlay({currentTime: 0})
        this._updateLastOnProgress(0)
      } else {
        this._onPlay({currentTime: this.getCurrentTime()})
      }
      this.hideOverlay()
    } else {
      this._onStop()
    }
    this.setState({ paused: !this.state.paused })
  }

  _onPlay (arg) {
    if (this.props.onPlay) {
      this.props.onPlay(arg)
    }
    this._timeInterval = this.setInterval(this._onTimeInterval, 30)
  }

  _onStop () {
    this.clearInterval(this._timeInterval)
  }

  _onTimeInterval () {
    if (this._timeline) {
      this._timeline.updateCurrentTime(this.getCurrentTime())
    }
  }

  _onProgress (arg) {
    if (this.props.onProgress) {
      this.props.onProgress(arg)
    }
    this._updateLastOnProgress(arg.currentTime)
  }

  _updateLastOnProgress (currentTime) {
    this.lastOnProgress = {
      videoTime: currentTime,
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
    this._updateLastOnProgress(time)
    this._onTimeInterval()
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

    var playToggle
    if (this.state.paused) {
      playToggle =
        <MaterialIcon
          name='play-arrow'
          style={{...styles.overlayIcon, ...styles.playButton}} />
    } else {
      playToggle =
        <MaterialIcon
          name='pause'
          style={{...styles.overlayIcon, ...styles.playButton}} />
    }

    var muteToggle
    if (this.state.muted) {
      muteToggle =
        <MaterialIcon
          name='volume-off'
          style={{...styles.overlayIcon, ...styles.overlaySmallIcon}} />
    } else {
      muteToggle =
        <MaterialIcon
          name='volume-up'
          style={{...styles.overlayIcon, ...styles.overlaySmallIcon}} />
    }

    if (this.state.showOverlay) {
      var overlayPointerEvents = 'auto'
    } else {
      overlayPointerEvents = 'none'
    }

    var overlay =
      <Animated.View style={overlayStyle} pointerEvents={overlayPointerEvents}>
        <View style={{...styles.overlaySmallBar, ...styles.overlayTop}}>
          <TouchableOpacity onPress={this.onClose}>
            <MaterialIcon
              name='keyboard-arrow-down'
              style={{...styles.overlayIcon, ...styles.overlaySmallIcon}} />
          </TouchableOpacity>
        </View>
        <View style={styles.overlayContent}>
          <TouchableOpacity onPress={this.togglePlay}>
            {playToggle}
          </TouchableOpacity>
        </View>
        <View style={{...styles.overlaySmallBar, ...styles.overlayBottom}}>
          <View style={{...styles.overlaySmallBar, ...styles.contentCenter}}>
            <TouchableOpacity onPress={this.toggleMute}>
              {muteToggle}
            </TouchableOpacity>
            <Timeline
              ref={(ref) => { this._timeline = ref }}
              currentTime={this.getCurrentTime()}
              duration={this.state.duration}
              onVideoTimeChange={this._onVideoTimeChange} />
          </View>
        </View>
      </Animated.View>

    return (
      <TouchableWithoutFeedback onPress={this.onPressVideo}>
        <View>
          <Video
            source={this.props.video}
            onLoad={this.onLoad}
            ref={(ref) => { this.player = ref }}
            onProgress={(arg) => { this._onProgress(arg) }}
            onEnd={(arg) => { this._onEnd(arg) }}
            paused={this.state.paused}
            style={videoStyle}
            muted={this.state.muted}
            resizeMode='cover'
            />
          {overlay}
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

VideoPlayer.propTypes = {
  video: PropTypes.object.isRequired,
  onClose: PropTypes.func,
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
  },

  overlayIcon: {
    color: 'white'
  },

  overlaySmallBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  overlaySmallIcon: {
    fontSize: 30,
    padding: 10
  },

  overlayContent: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  overlayBottom: {
    alignItems: 'flex-end'
  },

  contentCenter: {
    alignItems: 'center'
  },

  overlayTop: {
  },

  playButton: {
    fontSize: 72
  }
}

reactMixin(VideoPlayer.prototype, TimerMixin)
