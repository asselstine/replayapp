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
import { ActivityOverlayContainer } from './activity-overlay-container'
import EventEmitter from 'EventEmitter'

export class VideoPlayer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      paused: true,
      playerOverlayProgress: new Animated.Value(1),
      showPlayerOverlay: true,
      muted: true,
      eventEmitter: new EventEmitter()
    }
    this._onActivityTimeChange = this._onActivityTimeChange.bind(this)
    this._onVideoTimeChange = this._onVideoTimeChange.bind(this)
    this.onPressVideo = this.onPressVideo.bind(this)
    this.hidePlayerOverlay = this.hidePlayerOverlay.bind(this)
    this.togglePlay = this.togglePlay.bind(this)
    this.toggleMute = this.toggleMute.bind(this)
    this.toggleFullscreen = this.toggleFullscreen.bind(this)
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
      this.state.playerOverlayProgress,
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
      this.state.playerOverlayProgress,
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
    this.timeout = this.setTimeout(this.hidePlayerOverlay, 3000)
  }

  onPressVideo (e) {
    this.toggleOverlay()
  }

  _onVideoTimeChange (time) {
    this.resetOverlayHideTimeout()
    this.seek(time)
  }

  _onActivityTimeChange (time) {
    this.seek(Video.streamTimeToVideoTime(this.props.video, time))
  }

  toggleOverlay () {
    if (!this.state.showPlayerOverlay) {
      this.showPlayerOverlay()
      this.resetOverlayHideTimeout()
    } else {
      this.hidePlayerOverlay()
    }
  }

  toggleFullscreen () {
    if (this.props.onToggleFullscreen) {
      this.props.onToggleFullscreen()
      this.resetOverlayHideTimeout()
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
    this.state.eventEmitter.emit('progressVideoTime', this.getCurrentTime())
    this.state.eventEmitter.emit('progressActivityTime', this.getCurrentTimeActivity())
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

  getCurrentTimeActivity () {
    return Video.videoTimeToStreamTime(this.props.video, this.getCurrentTime())
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
      backgroundColor: 'black',
      width: '100%',
    }, { $merge: this.props.style })

    if (!videoStyle.height) {
      videoStyle.aspectRatio = whAspectRatio
    }

    var playerOverlayStyle = {
      opacity: this.state.playerOverlayProgress
    }

    var activityOverlayStyle = {
      opacity: this.state.playerOverlayProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0]
      })
    }

    if (this.state.showPlayerOverlay) {
      var playerOverlayPointerEvents = 'auto'
    } else {
      playerOverlayPointerEvents = 'none'
    }

    if (!this.state.showPlayerOverlay && !this.props.hideActivityOverlay) {
      var activityOverlayPointerEvents = 'auto'
    } else {
      activityOverlayPointerEvents = 'none'
    }

    var duration = this.props.video.rawVideoData.duration

    var activityStartTime = Video.videoTimeToStreamTime(this.props.video, 0)
    var activityEndTime = Video.videoTimeToStreamTime(this.props.video, duration)

    if (this.props.video.activity && !this.props.hideActivityOverlay) {
      var activityOverlay =
        <ActivityOverlayContainer
          eventEmitter={this.state.eventEmitter}
          activity={this.props.video.activity}
          currentTimeActivity={this.getCurrentTimeActivity()}
          onActivityTimeChange={this._onActivityTimeChange}
          style={activityOverlayStyle}
          pointerEvents={activityOverlayPointerEvents}
          activityStartTime={activityStartTime}
          activityEndTime={activityEndTime}
          video={this.props.video} />
    }

    return (
      <TouchableWithoutFeedback onPress={this.onPressVideo}>
        <View style={this.props.style}>
          <RNVideo
            source={this.props.video.videoSource}
            ref={(ref) => { this.player = ref }}
            onLoad={(arg) => { this._onTimeInterval() }}
            onError={(arg) => { this.onError(arg) }}
            onProgress={(arg) => { this._onProgress(arg) }}
            onEnd={(arg) => { this._onEnd(arg) }}
            paused={this.state.paused}
            style={videoStyle}
            muted={this.state.muted}
            resizeMode='fill'
            />
          <PlayerOverlay
            eventEmitter={this.state.eventEmitter}
            paused={this.state.paused}
            muted={this.state.muted}
            fullscreen={this.props.fullscreen}
            duration={duration}
            currentTime={this.getCurrentTime()}
            onToggleFullscreen={this.toggleFullscreen}
            onTogglePaused={this.togglePlay}
            onToggleMuted={this.toggleMute}
            onVideoTimeChange={this._onVideoTimeChange}
            onClose={this.onClose}
            style={playerOverlayStyle}
            pointerEvents={playerOverlayPointerEvents} />
          {activityOverlay}
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
  style: PropTypes.object,
  fullscreen: PropTypes.bool,
  onToggleFullscreen: PropTypes.func,
  hideActivityOverlay: PropTypes.bool
}

VideoPlayer.defaultProps = {
  style: {},
  fullscreen: false
}
