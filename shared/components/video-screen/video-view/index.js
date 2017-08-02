import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { VideoPlayer } from '../../video-player'
import {
  Animated,
  View,
  Button
} from 'react-native'
import EventEmitter from 'EventEmitter'
import { connect } from 'react-redux'
import _ from 'lodash'
import moment from 'moment'
import { manager } from '../../../oauth'
import { store } from '../../../store'
import { attachActivity, setVideoStartAt } from '../../../actions/video-actions'
import { login } from '../../../actions/strava-actions'
import { StravaActivitySelectModal } from './strava-activity-select-modal'
import { ActivityStreams } from './activity-streams'
import { ActivityMap } from './activity-map'
import { ActivitySegments } from './activity-segments'
import { StreamsService } from '../../../services/streams-service'
import { Rotator } from './rotator'
import ScrollableTabView from 'react-native-scrollable-tab-view'

export const VideoView = connect(
  (state, ownProps) => {
    var video = _.get(state, `videos[${ownProps.localIdentifier}]`)
    var result = {
      video: video
    }
    var activity = _.get(video, 'activity')
    if (activity) {
      result['streams'] = _.get(state, `streams['${activity.id}']`)
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
      videoPlayerWidth: 1,
      videoPlayerHeight: 1
    }
    this.onProgress = this.onProgress.bind(this)
    this.onPlay = this.onPlay.bind(this)
    this.onToggleLock = this.onToggleLock.bind(this)
    this.onPressStravaConnect = this.onPressStravaConnect.bind(this)
    this._onCloseStravaActivityModal = this._onCloseStravaActivityModal.bind(this)
    this._onSelectStravaActivity = this._onSelectStravaActivity.bind(this)
    this._onCloseSyncModal = this._onCloseSyncModal.bind(this)
    this._onSaveSyncModal = this._onSaveSyncModal.bind(this)
    this.eventEmitter = new EventEmitter()
  }

  onPressStravaConnect () {
    manager.authorize('strava', { scopes: 'view_private' })
      .then((response) => {
        store.dispatch(login(response.response.credentials))
        this.setState({ stravaActivityModalIsOpen: true })
      })
      .catch(response => console.log('could not authenticate: ', response))
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
    this.checkSyncModal(this.props)
    if (_.get(this.props, 'video.activity')) {
      StreamsService.retrieveStreams(this.props.video.activity.id)
    }
    this.checkStreams(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.checkSyncModal(nextProps)
    this.checkStreams(nextProps)
  }

  checkStreams (props) {
    if (_.get(props, 'video.activity.id') && !props.streams) {
      StreamsService.retrieveStreams(_.get(props, 'video.activity.id'))
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
    var activityStartAt = moment(_.get(this.props, 'video.activity.start_date'))
    var videoStartAt = moment(_.get(this.props, 'video.startAt'))
    var deltaMs = videoStartAt.diff(activityStartAt)
    var videoTime = streamTime - (deltaMs / 1000.0)
    return videoTime
  }

  videoTimeToStreamTime (videoTime) {
    var streamStartAt = _.get(this.props, 'video.activity.start_date')
    var videoStartAt = _.get(this.props, 'video.startAt')
    if (!streamStartAt || !videoStartAt) { return null }
    var currentVideoTime = moment(videoStartAt).add(videoTime, 's')
    var result = moment(currentVideoTime).diff(moment(streamStartAt)) / 1000.0
    return result
  }

  render () {
    var activity = _.get(this.props, 'video.activity')
    var videoDuration = _.get(this.props, 'video.rawVideoData.duration') || 0
    var activityDuration = _.get(this.props, 'video.activity.elapsed_time') || 0

    var videoStreamStartTime = Math.max(0, Math.min(this.videoTimeToStreamTime(0), activityDuration))
    var videoStreamEndTime = Math.min(activityDuration, videoStreamStartTime + videoDuration)

    if (this.props.video) {
      var videoPlayer =
        <Rotator>
          <VideoPlayer
            ref={(ref) => { this._videoPlayer = ref }}
            onProgress={this.onProgress}
            onPlay={this.onPlay}
            style={styles.videoPlayer}
            video={this.props.video.src} />
        </Rotator>
    }

    if (activity) {
      var connectStravaButton =
        <Button
          title={activity.name}
          onPress={this.onPressStravaConnect}
          style={styles.titleHeaderButton} />

      var lockTitle = 'Unlock'
      if (!this.state.locked) {
        lockTitle = 'Lock'
      }
      var lockToggle =
        <Button
          title={lockTitle}
          onPress={this.onToggleLock}
          style={styles.titleHeaderButton} />
    } else {
      connectStravaButton =
        <Button
          onPress={this.onPressStravaConnect}
          title='Connect Strava'
          style={styles.titleHeaderButton}
          color='#fc4c02' />
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
        <ActivitySegments
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
          style={styles.streamsContainer}>
          {activitySegments}
          {activityStreams}
          {activityMap}
        </ScrollableTabView>
    }

    return (
      <View style={styles.videoView}>
        {videoPlayer}
        <View style={styles.titleHeader}>
          {connectStravaButton}
          {lockToggle}
        </View>
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

  titleHeader: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1000
  },

  titleHeaderButton: {
    flex: 1
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
    fontWeight: 'bold'
  }
}

VideoView.propTypes = {
  localIdentifier: PropTypes.string.isRequired,
  video: PropTypes.object,
  latlngStream: PropTypes.object,
  timeStream: PropTypes.object
}