import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { VideoPlayer } from '../../video-player'
import {
  Animated,
  View,
  StatusBar,
  Text,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native'
import EventEmitter from 'EventEmitter'
import { connect } from 'react-redux'
import _ from 'lodash'
import moment from 'moment'
import { manager } from '../../../oauth'
import { store } from '../../../store'
import { attachActivity, setVideoStartAt, resetVideoStartAt } from '../../../actions/video-actions'
import { login } from '../../../actions/strava-actions'
import { StravaActivitySelectModal } from './strava-activity-select-modal'
import { ActivityStreams } from './activity-streams'
import { ActivityMap } from './activity-map'
import { ActivitySegmentsContainer } from './activity-segments-container'
import { ActivityService } from '../../../services/activity-service'
import { Rotator } from './rotator'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import { NavigationEventEmitter } from '../../navigation-event-emitter'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import Orientation from 'react-native-orientation'
import * as colours from '../../../colours'
import { Video } from '../../../video'

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
      stravaActivityModalIsOpen: false,
      syncModalIsOpen: false,
      locked: true,
      landscape: false,
      videoRotate: new Animated.Value(0),
      width: 1,
      height: 1,
      showVideo: true
    }
    this.onProgress = this.onProgress.bind(this)
    this.onPlay = this.onPlay.bind(this)
    this._onLayout = this._onLayout.bind(this)
    this.onToggleLock = this.onToggleLock.bind(this)
    this.onPressStravaConnect = this.onPressStravaConnect.bind(this)
    this._onCloseStravaActivityModal = this._onCloseStravaActivityModal.bind(this)
    this._onSelectStravaActivity = this._onSelectStravaActivity.bind(this)
    this._onCloseSyncModal = this._onCloseSyncModal.bind(this)
    this._onSaveSyncModal = this._onSaveSyncModal.bind(this)
    this._onPressReset = this._onPressReset.bind(this)
    this.eventEmitter = new EventEmitter()
    this._onOrientationChange = this._onOrientationChange.bind(this)
    Orientation.getOrientation((err, orientation) => {
      if (err) {
        console.error(err)
      } else {
        this._onOrientationChange(orientation)
      }
    })
  }

  _showTimestampWarning () {
    Alert.alert(
      'Manual time alignment required',
      'The file creation date for the video is way off from the activity date.  You will need to synchronize the times by unlocking the video then scrubbing',
      [
        { text: 'Ok' },
      ]
    )
  }

  _onLayout (event) {
    this.setState({
      width: _.get(event, 'nativeEvent.layout.width'),
      height: _.get(event, 'nativeEvent.layout.height')
    })
  }

  _onOrientationChange (orientation) {
    var landscape =
      (orientation === 'LANDSCAPE' || (orientation === 'UNKNOWN' && this.state.landscape))
    this.setState({ landscape: landscape })
  }

  onPressStravaConnect () {
    manager.authorize('strava', { scopes: 'view_private' })
      .then((response) => {
        store.dispatch(login(response.response.credentials))
        this.setState({ stravaActivityModalIsOpen: true })
      })
      .catch(response => console.log('could not authenticate: ', response))
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

  resetTime () {
    store.dispatch(resetVideoStartAt(this.props.video.rawVideoData))
  }

  onToggleLock () {
    this.setState({locked: !this.state.locked})
  }

  onProgress (event) {
    this.eventEmitter.emit('onStreamTimeProgress', this.videoTimeToStreamTime(event.currentTime))
  }

  onPlay (event) {
    if (this._activityMap) {
      this._activityMap.recenter()
    }
    this.eventEmitter.emit('onStreamPlay', this.videoTimeToStreamTime(event.currentTime))
  }

  _onSelectStravaActivity (activity) {
    store.dispatch(attachActivity(this.props.video.rawVideoData, activity))
    this._onCloseStravaActivityModal()
  }

  _onCloseStravaActivityModal () {
    this.setState({ stravaActivityModalIsOpen: false })
  }

  _onCloseSyncModal () {
    this.setState({ syncModalIsOpen: false })
  }

  _onSaveSyncModal (videoStartAt) {
    store.dispatch(setVideoStartAt(this.props.video.rawVideoData, videoStartAt))
    this._onCloseSyncModal()
  }

  componentDidMount () {
    Orientation.lockToPortrait()
    Orientation.addOrientationListener(this._onOrientationChange)
    this.checkSyncModal(this.props)
    if (_.get(this.props, 'video.activity')) {
      ActivityService.retrieveStreams(this.props.video.activity.id)
    }
    this.checkStreams(this.props)
    this._transitionEndListener = NavigationEventEmitter.addListener('transitionEnd', this._transitionEnd.bind(this))
  }

  componentWillUnmount () {
    this._transitionEndListener.remove()
    Orientation.removeOrientationListener(this._onOrientationChange)
  }

  _transitionEnd () {
    this.setState({
      showVideo: true
    })
  }

  componentWillReceiveProps (nextProps) {
    this.checkSyncModal(nextProps)
    this.checkStreams(nextProps)
  }

  checkStreams (props) {
    var videoActivityId = _.get(props, 'video.activity.id')
    if (videoActivityId && !props.streams) { //needs props.streams to prevent recursion.
      ActivityService.retrieveStreams(videoActivityId)
    }
  }

  checkSyncModal (props) {
    if (props.video && !props.video.startAt) {
      this.setState({ syncModalIsOpen: true })
    }
  }

  onStreamTimeChange (streamTime) {
    if (this.state.locked) {
      this._videoPlayer.seek(this.streamTimeToVideoTime(streamTime))
    } else {
      this.eventEmitter.emit('onStreamTimeProgress', streamTime)
      store.dispatch(
        setVideoStartAt(this.props.video.rawVideoData, this.calculateVideoStartAt(streamTime))
      )
    }
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

  render () {
    var activity = _.get(this.props, 'video.activity')
    var videoDuration = _.get(this.props, 'video.rawVideoData.duration') || 0
    var activityDuration = _.get(this.props, 'video.activity.elapsed_time') || 0

    var videoStreamStartTime = Math.max(0, Math.min(this.videoTimeToStreamTime(0), activityDuration))
    var videoStreamEndTime = Math.min(activityDuration, videoStreamStartTime + videoDuration)

    if (videoStreamStartTime === videoStreamEndTime) {
      var warning =
        <TouchableOpacity onPress={this._showTimestampWarning}>
          <MaterialIcon
            name='warning'
            style={{...styles.titleHeaderIcon, ...styles.titleWarningIcon}} />
        </TouchableOpacity>
    }

    var hwAspectRatio = this.props.video.rawVideoData.height / (1.0 * this.props.video.rawVideoData.width)
    var videoHeight = this.state.width * hwAspectRatio

    if (this.props.video && this.state.showVideo) {
      var videoPlayer =
        <Rotator
          width={this.state.width}
          height={videoHeight}
          landscape={this.state.landscape}>
          <VideoPlayer
            ref={(ref) => { this._videoPlayer = ref }}
            hideActivityOverlay={!this.state.landscape}
            onProgress={this.onProgress}
            onPlay={this.onPlay}
            onClose={this.props.onClose}
            style={styles.videoPlayer}
            video={this.props.video} />
        </Rotator>
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
          onStreamTimeChange={(streamTime) => this.onStreamTimeChange(streamTime)}
          eventEmitter={this.eventEmitter}
          activity={activity}
          streams={this.props.streams} />
      activitySegments =
        <ActivitySegmentsContainer
          tabLabel='Race'
          eventEmitter={this.eventEmitter}
          onStreamTimeChange={(streamTime) => this.onStreamTimeChange(streamTime)}
          activity={activity} />

      if (this.props.streams) {
        activityStreams =
          <ActivityStreams
            tabLabel='Data'
            onStreamTimeChange={(streamTime) => this.onStreamTimeChange(streamTime)}
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
          tabBarActiveTextColor={colours.STRAVA_BRAND_COLOUR}
          tabBarUnderlineStyle={{backgroundColor: colours.STRAVA_BRAND_COLOUR}}
          style={styles.streamsContainer}>
          {activitySegments}
          {activityStreams}
          {activityMap}
        </ScrollableTabView>
    }

    return (
      <View style={styles.videoView} onLayout={this._onLayout}>
        <StatusBar hidden />
        {videoPlayer}
        {header}
        {activityInfo}
        <StravaActivitySelectModal
          isOpen={this.state.stravaActivityModalIsOpen}
          onSelect={this._onSelectStravaActivity}
          onClose={this._onCloseStravaActivityModal} />
      </View>
    )
  }
})

const styles = {
  videoView: {
    flex: 1
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
    flex: 1,
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
  }
}

VideoView.propTypes = {
  localIdentifier: PropTypes.string.isRequired,
  video: PropTypes.object,
  latlngStream: PropTypes.object,
  timeStream: PropTypes.object,
  onClose: PropTypes.func
}
