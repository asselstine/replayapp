import { Experiment } from '../../experiment'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { VideoPlayer } from '../../video-player'
import {
  Animated,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native'
import EventEmitter from 'EventEmitter'
import { connect } from 'react-redux'
import _ from 'lodash'
import moment from 'moment'
import { Strava } from '../../../strava'
import dispatchTrack from '../../../store/dispatch-track'
import { track } from '../../../analytics'
import activityProperties from '../../../analytics/activity-properties'
import videoProperties from '../../../analytics/video-properties'
import rawVideoDataProperties from '../../../analytics/raw-video-data-properties'
import { store } from '../../../store'
import { attachActivity, setVideoStartAt, resetVideoStartAt } from '../../../actions/video-actions'
import { login } from '../../../actions/strava-actions'
import { StravaActivitySelectModal } from './strava-activity-select-modal'
import { ActivityStreams } from './activity-streams'
import { ActivityMap } from '../../activity-map'
import { ActivitySegmentsContainer } from './activity-segments-container'
import { ActivityService } from '../../../services/activity-service'
import { AthleteService } from '../../../services/athlete-service'
import { Rotator } from './rotator'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import { NavigationEventEmitter } from '../../navigation-event-emitter'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import { ConnectDialog } from './connect-dialog'
import * as colours from '../../../colours'
import { Video } from '../../../video'
import { Activity } from '../../../activity'
import { SyncDialog } from './sync-dialog'
import analytics from '../../../analytics'
import reportError from '../../../report-error'

import connectWithStrava from '../../../../images/btn_strava_connectwith_orange2x.png'

export const VideoView = connect(
  (state, ownProps) => {
    var video = _.get(state, `videos[${ownProps.localIdentifier}]`)
    var result = {
      video: video
    }
    var activity = _.get(video, 'activity')
    if (activity) {
      result['streams'] = _.get(state, `activities['${activity.id}'].streams`)
    }
    return result
  }
)(class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      syncDialogIsOpen: false,
      stravaActivityModalIsOpen: false,
      locked: true,
      fullscreen: false,
      landscape: false,
      width: 1,
      height: 1,
      showVideo: true,
      warningFlash: new Animated.Value(0)
    }
    this.onProgress = this.onProgress.bind(this)
    this.onPlay = this.onPlay.bind(this)
    this._onLayout = this._onLayout.bind(this)
    this.onToggleLock = this.onToggleLock.bind(this)
    this.onToggleFullscreen = this.onToggleFullscreen.bind(this)
    this.onPressStravaConnect = this.onPressStravaConnect.bind(this)
    this._onCloseStravaActivityModal = this._onCloseStravaActivityModal.bind(this)
    this._onSelectStravaActivity = this._onSelectStravaActivity.bind(this)
    this._onPressReset = this._onPressReset.bind(this)
    this.eventEmitter = new EventEmitter()
    this._showTimestampWarning = this._showTimestampWarning.bind(this)
    this.trackOnChangeTab = this.trackOnChangeTab.bind(this)
    this._syncDialogOnClose = this._syncDialogOnClose.bind(this)
    this.onStreamTimeChange = this.onStreamTimeChange.bind(this)
    this.onStreamTimeChangeStart = this.onStreamTimeChangeStart.bind(this)
    this.onStreamTimeChangeEnd = this.onStreamTimeChangeEnd.bind(this)
    this.startWarningFlash()
  }

  startWarningFlash () {
    Animated.sequence([
      Animated.timing(this.state.warningFlash, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(this.state.warningFlash, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start(() => this.startWarningFlash())
  }

  _syncDialogOnClose () {
    this.setState({
      syncDialogIsOpen: false
    })
  }

  _showTimestampWarning () {
    this.setState({
      syncDialogIsOpen: true
    })
  }

  _onLayout (event) {
    var width = _.get(event, 'nativeEvent.layout.width') || 1
    var height = _.get(event, 'nativeEvent.layout.height') || 1
    var landscape = width > height
    this.setState({
      width,
      height,
      landscape
    })
  }

  onPressStravaConnect () {
    Strava.authorize()
          .then((response) => {
            dispatchTrack(login(response.response.credentials))
            AthleteService.retrieveCurrentAthlete().then(() => {
                var athlete = store.getState().athletes.data
                analytics.identify({
                  userId: athlete.id,
                  traits: {
                    firstname: athlete.firstname,
                    lastname: athlete.lastname,
                    city: athlete.city,
                    country: athlete.country,
                    email: athlete.email
                  }
                })
                this.setState({ stravaActivityModalIsOpen: true })
            }).catch(reportError)
          })
          .catch(reportError)
  }

  _onPressReset () {
    Alert.alert(
      'Reset time to video creation date?',
      'This will reset the video start time to the file creation date',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => { this.resetTime() } }
      ]
    )
  }

  onToggleFullscreen () {
    this.setState({ fullscreen: !this.state.fullscreen })
    if (this.props.onToggleFullscreen) {
      this.props.onToggleFullscreen()
    }
  }

  resetTime () {
    dispatchTrack(resetVideoStartAt(this.props.video.rawVideoData), videoProperties(this.props.video))
  }

  onToggleLock () {
    this.setState({locked: !this.state.locked})
  }

  onProgress (videoTime) {
    this.eventEmitter.emit('onStreamTimeProgress', this.videoTimeToStreamTime(videoTime))
  }

  onPlay (event) {
    if (this._activityMap) {
      this._activityMap.recenter()
    }
    this.eventEmitter.emit('onStreamPlay', this.videoTimeToStreamTime(event.currentTime))
  }

  _onSelectStravaActivity (activity) {
    dispatchTrack(attachActivity(this.props.video.rawVideoData, activity), {
      video: videoProperties(this.props.video),
      activity: activityProperties(activity),
      isOutOfSync: Video.isOutOfSync(this.props.video, activity)
    })
    this._onCloseStravaActivityModal()
  }

  _onCloseStravaActivityModal () {
    this.setState({ stravaActivityModalIsOpen: false })
  }

  componentDidMount () {
    if (_.get(this.props, 'video.activity')) {
      ActivityService.retrieveStreams(this.props.video.activity.id)
    }
    this.checkStreams(this.props)
    this._transitionEndListener = NavigationEventEmitter.addListener('transitionEnd', this._transitionEnd.bind(this))
  }

  componentWillUnmount () {
    this._transitionEndListener.remove()
  }

  _transitionEnd () {
    this.setState({
      showVideo: true
    })
  }

  componentWillReceiveProps (nextProps) {
    this.checkStreams(nextProps)
  }

  checkStreams (props) {
    var videoActivityId = _.get(props, 'video.activity.id')
    if (videoActivityId && !props.streams) { //needs props.streams to prevent recursion.
      ActivityService.retrieveStreams(videoActivityId)
    }
  }

  onStreamTimeChangeStart () {
    this._videoPlayer.seekStart()
  }

  onStreamTimeChange (streamTime) {
    if (this.state.locked) {
      this._videoPlayer.seek(this.streamTimeToVideoTime(streamTime))
    } else {
      this.eventEmitter.emit('onStreamTimeProgress', streamTime)
      var videoStartAt = this.calculateVideoStartAt(streamTime)
      dispatchTrack(
        setVideoStartAt(this.props.video.rawVideoData, videoStartAt),
        {
          video: videoProperties(this.props.video),
          videoStartAt: videoStartAt
        }
      )
    }
  }

  onStreamTimeChangeEnd () {
    this._videoPlayer.seekEnd()
  }

  calculateVideoStartAt (streamTime) {
    var activityStartAt = moment(_.get(this.props, 'video.activity.start_date'))
    var videoTime = this._videoPlayer.getCurrentTime()
    var offset = streamTime - videoTime
    return activityStartAt.clone().add(offset, 's')
  }

  streamTimeToVideoTime (streamTime) {
    return Video.streamTimeToVideoTime(this.props.video, streamTime)
  }

  videoTimeToStreamTime (videoTime) {
    return Video.videoTimeToStreamTime(this.props.video, videoTime)
  }

  trackOnChangeTab ({i, ref}) {
    track({
      event: 'VideoViewTab',
      properties: {
        localIdentifier: this.props.localIdentifier,
        tabLabel: ref.props.tabLabel
      }
    })
  }

  render () {
    var activity = _.get(this.props, 'video.activity')
    var videoDuration = _.get(this.props, 'video.rawVideoData.duration') || 0

    if (Video.isOutOfSync(this.props.video)) {
      var warning =
        <TouchableOpacity onPress={this._showTimestampWarning}>
          <Animated.View style={{opacity: this.state.warningFlash}}>
            <MaterialIcon
              name='warning'
              style={{...styles.titleHeaderIcon, ...styles.titleWarningIcon}} />
          </Animated.View>
        </TouchableOpacity>
      var videoStreamStartTime = 0
      var videoStreamEndTime = Activity.streamEndAt(activity)
    } else {
      videoStreamStartTime = this.videoTimeToStreamTime(0)
      videoStreamEndTime = this.videoTimeToStreamTime(videoDuration)
    }

    var hwAspectRatio = this.props.video.rawVideoData.height / (1.0 * this.props.video.rawVideoData.width)
    var videoHeight = this.state.width * hwAspectRatio

    var videoPlayerContainerStyle = styles.videoPlayer

    if (this.state.fullscreen) {
      videoPlayerContainerStyle = styles.fullscreen.videoPlayer
    } else if (this.state.landscape) {
      videoPlayerContainerStyle = styles.landscape.videoPlayer
    }

    if (this.props.video && this.state.showVideo) {
      var videoPlayer =
        <View style={videoPlayerContainerStyle}>
          <VideoPlayer
            eventEmitter={this.eventEmitter}
            fullscreen={this.state.fullscreen}
            onToggleFullscreen={this.onToggleFullscreen}
            ref={(ref) => { this._videoPlayer = ref }}
            hideActivityOverlay={!this.state.fullscreen}
            onProgress={this.onProgress}
            onPlay={this.onPlay}
            onClose={this.props.onClose}
            video={this.props.video} />
        </View>
    }

    if (this.props.video && !activity) {
      var connectDialog = <ConnectDialog />
    }

    if (activity) {
      var changeActivityButton =
        <View style={styles.activityButton}>
          <TouchableOpacity onPress={this.onPressStravaConnect}>
            <Text style={styles.activityButtonText}>
              {activity.name}
            </Text>
          </TouchableOpacity>
        </View>

      var lockReset =
        <TouchableOpacity onPress={this._onPressReset}>
          <MaterialCommunityIcon
            name='lock-reset'
            style={styles.titleHeaderIcon} />
        </TouchableOpacity>

      var lockContent
      if (this.state.locked) {
        lockContent =
          <MaterialCommunityIcon
            name='lock'
            style={styles.titleHeaderIcon} />
      } else {
        lockContent =
          <MaterialCommunityIcon
            name='lock-open'
            style={styles.titleHeaderIcon} />
      }
      var lockToggle =
        <TouchableOpacity onPress={this.onToggleLock}>
          {lockContent}
        </TouchableOpacity>

      var lockControls =
        <View style={styles.lockControls}>
          {warning}
          {lockReset}
          {lockToggle}
        </View>

      var header =
        <View style={styles.header}>
          <View style={styles.titleHeader}>
            {changeActivityButton}
            {lockControls}
          </View>
        </View>
    } else {
      header =
        <View style={styles.connectHeader}>
          <TouchableOpacity onPress={this.onPressStravaConnect}>
            <Image
              resizeMode='contain'
              style={styles.connectStravaButton}
              source={connectWithStrava} />
          </TouchableOpacity>
        </View>
    }

    var activityInfo, activityStreams, activityMap, activitySegments

    if (activity) {
      activityMap =
        <ActivityMap
          tabLabel='Map'
          ref={(ref) => { this._activityMap = ref }}
          onStreamTimeChange={this.onStreamTimeChange}
          streamTime={this.videoTimeToStreamTime(0)}
          eventEmitter={this.eventEmitter}
          activity={activity}
          streams={this.props.streams}
          videoStreamStartTime={videoStreamStartTime}
          videoStreamEndTime={videoStreamEndTime} />
      activitySegments =
        <ActivitySegmentsContainer
          tabLabel='Race'
          eventEmitter={this.eventEmitter}
          onStreamTimeChange={this.onStreamTimeChange}
          onStreamTimeChangeStart={this.onStreamTimeChangeStart}
          onStreamTimeChangeEnd={this.onStreamTimeChangeEnd}
          video={this.props.video}
          activity={activity} />

      if (this.props.streams) {
        activityStreams =
          <ActivityStreams
            tabLabel='Data'
            onStreamTimeChange={this.onStreamTimeChange}
            onStreamTimeChangeStart={this.onStreamTimeChangeStart}
            onStreamTimeChangeEnd={this.onStreamTimeChangeEnd}
            eventEmitter={this.eventEmitter}
            activity={activity}
            streams={this.props.streams}
            videoStreamStartTime={videoStreamStartTime}
            videoStreamEndTime={videoStreamEndTime} />
      }

      activityInfo =
        <ScrollableTabView
          locked
          tabBarTextStyle={styles.tabBarTextStyle}
          tabBarActiveTextColor={colours.BRAND}
          tabBarUnderlineStyle={{backgroundColor: colours.BRAND}}
          onChangeTab={this.trackOnChangeTab}
          style={styles.streamsContainer}>
          {activityStreams}
          {activityMap}
          {activitySegments}
        </ScrollableTabView>
    }

    if (this.state.landscape) {
      var videoViewStyle = styles.landscape.videoView
    } else {
      videoViewStyle = styles.videoView
    }

    if (!this.state.fullscreen) {
      var activityView =
        <View style={styles.activityView}>
          {header}
          {activityInfo}
        </View>
    }

    return (
      <View style={videoViewStyle} onLayout={this._onLayout}>
        <StatusBar hidden={this.state.fullscreen} />
        {connectDialog}

        {videoPlayer}

        {activityView}

        <SyncDialog isOpen={this.state.syncDialogIsOpen} onClose={this._syncDialogOnClose} />
        <StravaActivitySelectModal
          isOpen={this.state.stravaActivityModalIsOpen}
          onSelect={this._onSelectStravaActivity}
          onClose={this._onCloseStravaActivityModal} />
      </View>
    )
  }
})

const styles = {
  landscape: {
    videoView: {
      flex: 1,
      flexDirection: 'row'
    },

    videoPlayer: {
      flex: 1,
    }
  },
  videoPlayer: {
    maxHeight: 210,
    backgroundColor: 'black'
  },
  fullscreen: {
    videoPlayer: {
      width: '100%',
      height: '100%',
      backgroundColor: 'black'
    }
  },

  videoView: {
    flex: 1
  },

  activityView: {
    flex: 1,
  },

  connectStravaButton: {
    width: 193
  },

  header: {
    flex: 0
  },

  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1000
  },

  connectHeader: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  activityButton: {
    flex: 0,
    padding: 10,
    paddingRight: 100,
    flexDirection: 'row'
  },

  activityButtonText: {
    fontSize: 20,
    fontWeight: '300',
    color: 'black'
  },

  titleHeaderIcon: {
    color: 'black',
    fontSize: 24,
    paddingTop: 10,
    paddingRight: 10
  },

  titleWarningIcon: {
    color: 'red'
  },

  connectButton: {
    flex: 1
  },

  lockButton: {
    flex: 1
  },

  streamsContainer: {
    flex: 1
  },

  tabBarTextStyle: {
    fontSize: 18,
    fontWeight: '200'
  },

  lockControls: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    right: 0
  },
}

VideoView.propTypes = {
  localIdentifier: PropTypes.string.isRequired,
  video: PropTypes.object,
  latlngStream: PropTypes.object,
  timeStream: PropTypes.object,
  onClose: PropTypes.func,
  onToggleFullscreen: PropTypes.func
}
