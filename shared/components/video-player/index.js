import React, { Component } from 'react'
import PropTypes from 'prop-types'
import update from 'immutability-helper'
import RNVideo from 'react-native-video'
import TimerMixin from 'react-timer-mixin'
import reactMixin from 'react-mixin'
import { Video } from '../../video'
import {
  TouchableWithoutFeedback,
  Animated,
  View
} from 'react-native'
import { PlayerOverlay } from './player-overlay'
import { ActivityOverlay } from './activity-overlay'

export class VideoPlayer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      paused: true,
      overlayOpacity: new Animated.Value(1),
      showPlayerOverlay: true,
      muted: true
    }
    this._onVideoTimeChange = this._onVideoTimeChange.bind(this)
    this.onPressVideo = this.onPressVideo.bind(this)
    this.hidePlayerOverlay = this.hidePlayerOverlay.bind(this)
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

  onError (e) {
    console.error('ERROR: ', e)
  }

  showPlayerOverlay () {
    Animated.timing(
      this.state.overlayOpacity,
      {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }
    ).start()
    this.setState({ showPlayerOverlay: true })
  }

  hidePlayerOverlay () {
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
    this.setState({ showPlayerOverlay: false })
  }

  resetOverlayHideTimeout () {
    if (this.timeout) {
      this.clearTimeout(this.timeout)
    }
    // this.timeout = this.setTimeout(this.hidePlayerOverlay, 3000)
  }

  onPressVideo (e) {
    this.toggleOverlay()
  }

  _onVideoTimeChange (time) {
    this.resetOverlayHideTimeout()
    this.seek(time)
  }

  toggleOverlay () {
    if (!this.state.showPlayerOverlay) {
      this.showPlayerOverlay()
      this.resetOverlayHideTimeout()
    } else {
      this.hidePlayerOverlay()
    }
  }

  toggleMute () {
    this.setState({ muted: !this.state.muted })
    this.resetOverlayHideTimeout()
  }

  togglePlay () {
    if (this.state.paused) {
      if (this.getCurrentTime() >= this.props.video.rawVideoData.duration) {
        this.player.seek(0)
        this._onPlay({currentTime: 0})
        this._updateLastOnProgress(0)
      } else {
        this._onPlay({currentTime: this.getCurrentTime()})
      }
      this.hidePlayerOverlay()
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
    var videoTime = this.getCurrentTime()
    if (this._playerOverlay) {
      this._playerOverlay.updateCurrentTime(videoTime)
    }
    var activityTime = Video.videoTimeToStreamTime(this.props.video, videoTime)
    if (this._activityOverlay) {
      this._activityOverlay.updateCurrentTime(activityTime)
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
    var whAspectRatio = this.props.video.rawVideoData.width / (1.0 * this.props.video.rawVideoData.height)
    let videoStyle = update({
      width: '100%',
      aspectRatio: whAspectRatio
    }, { $merge: this.props.style })

    var overlayStyle = {
      opacity: this.state.overlayOpacity
    }

    if (this.state.showPlayerOverlay) {
      var overlayPointerEvents = 'auto'
    } else {
      overlayPointerEvents = 'none'
    }

    return (
      <TouchableWithoutFeedback onPress={this.onPressVideo}>
        <View>
          <RNVideo
            source={this.props.video.videoSource}
            ref={(ref) => { this.player = ref }}
            onError={(arg) => { this.onError(arg) }}
            onProgress={(arg) => { this._onProgress(arg) }}
            onEnd={(arg) => { this._onEnd(arg) }}
            paused={this.state.paused}
            style={videoStyle}
            muted={this.state.muted}
            resizeMode='cover'
            />
          <PlayerOverlay
            ref={(ref) => { this._playerOverlay = ref }}
            paused={this.state.paused}
            muted={this.state.muted}
            duration={this.props.video.rawVideoData.duration}
            currentTime={this.getCurrentTime()}
            onTogglePaused={this.togglePlay}
            onToggleMuted={this.toggleMute}
            onVideoTimeChange={this._onVideoTimeChange}
            onClose={this.onClose}
            style={overlayStyle}
            pointerEvents={overlayPointerEvents} />
          <ActivityOverlay
            ref={(ref) => { this._activityOverlay = ref }}
            activity={this.props.video.activity} />
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

reactMixin(VideoPlayer.prototype, TimerMixin)

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
