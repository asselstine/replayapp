import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { VideoPlayer } from '../video-player'
import {
  View,
  ScrollView,
  Button
} from 'react-native'
import { connect } from 'react-redux'
import _ from 'lodash'
import { manager } from '../../oauth'
import { store } from '../../store'
import { attachActivity, setVideoStartAt } from '../../actions/video-actions'
import { login } from '../../actions/strava-actions'
import { StravaActivitySelectModal } from './strava-activity-select-modal'
import { ActivityStreams } from './activity-streams'
import Orientation from 'react-native-orientation'
import { ActivityMap } from './activity-map'
import { StreamsService } from '../../services/streams-service'

export const VideoView = connect(
  (state, ownProps) => {
    var video = _.get(state, `videos[${ownProps.videoUri}]`)
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
      syncModalIsOpen: false
    }
    this.onPressStravaConnect = this.onPressStravaConnect.bind(this)
    this._onCloseStravaActivityModal = this._onCloseStravaActivityModal.bind(this)
    this._onSelectStravaActivity = this._onSelectStravaActivity.bind(this)
    this._onCloseSyncModal = this._onCloseSyncModal.bind(this)
    this._onSaveSyncModal = this._onSaveSyncModal.bind(this)
    this._onOrientationChange = this._onOrientationChange.bind(this)
  }

  onPressStravaConnect () {
    manager.authorize('strava', { scopes: 'view_private' })
      .then((response) => {
        store.dispatch(login(response.response.credentials))
        this.setState({ stravaActivityModalIsOpen: true })
      })
      .catch(response => console.log('could not authenticate: ', response))
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

  _onOrientationChange (event) {
    console.log(event)
  }

  componentDidMount () {
    this.checkSyncModal(this.props)
    Orientation.addOrientationListener(this._onOrientationChange)
    if (_.get(this.props, 'video.activity')) {
      StreamsService.retrieveStreams(this.props.video.activity.id)
    }
  }

  componentWillUnmount () {
    Orientation.removeOrientationListener(this._onOrientationChange)
  }

  componentWillReceiveProps (nextProps) {
    this.checkSyncModal(nextProps)
    if (_.get(this.props, 'video.activity.id') !== _.get(nextProps, 'video.activity.id') && !this.props.streams) {
      StreamsService.retrieveStreams(_.get(nextProps, 'video.activity.id'))
    }
  }

  checkSyncModal (props) {
    if (props.video && !props.video.startAt) {
      this.setState({ syncModalIsOpen: true })
    }
  }

  render () {
    var activity = _.get(this.props, 'video.activity')
    var startAt = _.get(this.props, 'video.startAt')

    if (this.props.video) {
      var videoPlayer =
        <VideoPlayer video={this.props.video.rawVideoData._videoRef} styles={styles.videoPlayer} />
    }

    if (activity) {
      var connectStravaButton =
        <Button title={activity.name} onPress={this.onPressStravaConnect} />
    } else {
      connectStravaButton =
        <Button
          onPress={this.onPressStravaConnect}
          title='Connect Strava'
          color='#fc4c02' />
    }

    if (activity) {
      var activityMap =
        <ActivityMap
          activity={activity}
          streams={this.props.streams} />
    }

    if (activity && this.props.streams) {
      var activityStreams =
        <ActivityStreams
          activity={activity}
          streams={this.props.streams}
          videoDuration={this.props.video.rawVideoData.duration}
          videoStartAt={startAt} />
    }

    return (
      <View style={styles.videoView}>
        {videoPlayer}
        <ScrollView styles={styles.streamsContainer}>
          {connectStravaButton}
          {activityStreams}
          {activityMap}
        </ScrollView>
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
    flex: 1,
    flexDirection: 'column'
  },

  videoPlayer: {
    flex: 1
  },

  streamsContainer: {
    flex: 1
  }
}

VideoView.propTypes = {
  videoUri: PropTypes.string.isRequired,
  video: PropTypes.object,
  latlngStream: PropTypes.object,
  timeStream: PropTypes.object
}
