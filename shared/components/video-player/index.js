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
import reportError from '../../report-error'
import _ from 'lodash'

const SEEK_THROTTLE = 30
const PROGRESS_INTERVAL = 30

export class VideoPlayer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      paused: true,
      playerOverlayProgress: new Animated.Value(1),
      showPlayerOverlay: true,
      muted: true,
    }
    this._onLoadStart = this._onLoadStart.bind(this)
    this._onBuffer = this._onBuffer.bind(this)
    this._onActivityTimeChange = this._onActivityTimeChange.bind(this)
    this._onVideoTimeChange = this._onVideoTimeChange.bind(this)
    this.onPressVideo = this.onPressVideo.bind(this)
    this.hidePlayerOverlay = this.hidePlayerOverlay.bind(this)
    this.togglePlay = this.togglePlay.bind(this)
    this.toggleMute = this.toggleMute.bind(this)
    this.toggleFullscreen = this.toggleFullscreen.bind(this)
    this.finishHideOverlay = this.finishHideOverlay.bind(this)
    this._fireTimeEvents = this._fireTimeEvents.bind(this)
    this.onClose = this.onClose.bind(this)
    this.seek = this.seek.bind(this)
    this.seekStart = this.seekStart.bind(this)
    this.seekEnd = this.seekEnd.bind(this)
    this._throttledSeek = _.throttle(this._throttledSeek.bind(this), SEEK_THROTTLE, { trailing: false })
    this._updateLastOnProgress(0)
  }

  onClose (e) {
    if (this.props.onClose) {
      this.props.onClose(e)
    }
  }

  _onError (e) {
    reportError(e)
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
    // this.timeout = this.setTimeout(this.hidePlayerOverlay, 3000)
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

  componentDidMount () {
    this._timeInterval = this.setInterval(this._fireTimeEvents, PROGRESS_INTERVAL)
  }

  componentWillUnmount () {
    this.clearInterval(this._timeInterval)
  }

  componentWillReceiveProps ( props) {
  }

  togglePlay () {
    if (this.state.paused) {
      // this.seek(this.getCurrentTime())
      if (this.props.onPlay) {
        this.props.onPlay({currentTime: this.getCurrentTime()})
      }
      // this._fireTimeEvents()
    } else {
      this._onStop()
    }
    this._fireTimeEvents()
    this.setState({ paused: !this.state.paused })
  }

  _onStop () {
    // this.clearInterval(this._timeInterval)
  }

  _onBuffer (event) {
  }

  _onLoadStart (event) {
  }

  _fireTimeEvents () {
    var videoTime = this.getCurrentTime()
    if (this.props.onProgress) {
      this.props.onProgress(videoTime)
    }
    this.props.eventEmitter.emit('progressVideoTime', videoTime)
    this.props.eventEmitter.emit('progressActivityTime', this.getCurrentTimeActivity())
  }

  _onProgress (event) {
    this.lastVideoTime = event.currentTime
    if (!this.state.paused) {
      this.lastRealTime = new Date().valueOf()
    } else {
      this.lastRealTime = null
    }
  }

  _updateLastOnProgress (currentTime) {
    this.lastVideoTime = currentTime
    this.lastRealTime = null
  }

  getCurrentTime () {
    var diff = 0
    if (this.lastRealTime) {
      diff = new Date().valueOf() - this.lastRealTime
    }
    return this.lastVideoTime + diff / 1000.0
  }

  getCurrentTimeActivity () {
    return Video.videoTimeToStreamTime(this.props.video, this.getCurrentTime())
  }

  seekStart () {
    this.wasPaused = this.state.paused
    this.setState({ paused: true })
  }

  seekEnd () {
    this.setState({ paused: this.wasPaused })
  }

  seek (time) {
    this._throttledSeek(time)
    if (this.state.paused) {
      this._updateLastOnProgress(time)
      this._fireTimeEvents()
    }
  }

  _throttledSeek (time) {
    this.player.seek(time)
  }

  _onEnd (arg) {
    this.seek(0)
    this._updateLastOnProgress(0)
  }

  render () {
    var whAspectRatio = this.props.video.rawVideoData.width / (1.0 * this.props.video.rawVideoData.height)
    let videoStyle = update(styles.videoStyle, { $merge: this.props.style })

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

    // if (this.state.showPlayerOverlay) {
      var playerOverlayPointerEvents = 'auto'
    // } else {
    //   playerOverlayPointerEvents = 'none'
    // }
    //
    // if (!this.state.showPlayerOverlay && !this.props.hideActivityOverlay) {
      var activityOverlayPointerEvents = 'auto'
    // } else {
    //   activityOverlayPointerEvents = 'none'
    // }

    var duration = this.props.video.rawVideoData.duration

    var activityStartTime = Video.videoTimeToStreamTime(this.props.video, 0)
    var activityEndTime = Video.videoTimeToStreamTime(this.props.video, duration)

    if (this.props.video.activity && this.props.fullscreen /* !this.props.hideActivityOverlay */ ) {
      var activityOverlay =
        <ActivityOverlayContainer
          eventEmitter={this.props.eventEmitter}
          activity={this.props.video.activity}
          currentTimeActivity={this.getCurrentTimeActivity()}
          onActivityTimeChange={this._onActivityTimeChange}
          onActivityTimeChangeStart={this.seekStart}
          onActivityTimeChangeEnd={this.seekEnd}
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
            onLoadStart={this._onLoadStart}
            onLoad={(arg) => { this._fireTimeEvents() }}
            onProgress={(arg) => { this._onProgress(arg) }}
            onEnd={(arg) => { this._onEnd(arg) }}
            onError={(arg) => { this._onError(arg) }}
            onBuffer={this._onBuffer}
            paused={this.state.paused}
            style={videoStyle}
            muted={this.state.muted}
            repeat={false}
            resizeMode='fill'
            />
          <PlayerOverlay
            eventEmitter={this.props.eventEmitter}
            paused={this.state.paused}
            muted={this.state.muted}
            fullscreen={this.props.fullscreen}
            duration={duration}
            currentTime={this.getCurrentTime()}
            onToggleFullscreen={this.toggleFullscreen}
            onTogglePaused={this.togglePlay}
            onToggleMuted={this.toggleMute}
            onVideoTimeChange={this._onVideoTimeChange}
            onVideoTimeChangeStart={this.seekStart}
            onVideoTimeChangeEnd={this.seekEnd}
            onClose={this.onClose}
            style={playerOverlayStyle}
            pointerEvents={playerOverlayPointerEvents}>
            {activityOverlay}
          </PlayerOverlay>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

reactMixin(VideoPlayer.prototype, TimerMixin)

VideoPlayer.propTypes = {
  eventEmitter: PropTypes.object.isRequired,
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

const styles = {
  videoStyle: {
    backgroundColor: 'black',
    width: '100%',
  }
}
