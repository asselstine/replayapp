import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { VideoPlayer } from '../video-player'
import {
  View,
  Button
} from 'react-native'
import { connect } from 'react-redux'
import _ from 'lodash'
import moment from 'moment'
import { manager } from '../../oauth'
import { store } from '../../store'
import { attachActivity, setVideoStartAt } from '../../actions/video-actions'
import { login } from '../../actions/strava-actions'
import { StravaActivitySelectModal } from './strava-activity-select-modal'
import { SyncModalContainer } from './sync-modal-container'
import { ActivityStreamsContainer } from './activity-streams-container'

export const VideoView = connect(
  (state, ownProps) => {
    return {
      video: _.get(state, `videos[${ownProps.rawVideoData.video.uri}]`)
    }
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
    store.dispatch(attachActivity(this.props.rawVideoData, activity))
    this._onCloseStravaActivityModal()
  }

  _onCloseStravaActivityModal () {
    this.setState({ stravaActivityModalIsOpen: false })
  }

  _onCloseSyncModal () {
    this.setState({ syncModalIsOpen: false })
  }

  _onSaveSyncModal (videoStartAt) {
    store.dispatch(setVideoStartAt(this.props.rawVideoData, videoStartAt))
    this._onCloseSyncModal()
  }

  componentDidMount () {
    this.checkSyncModal(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.checkSyncModal(nextProps)
  }

  checkSyncModal (props) {
    if (props.video && !props.video.startAt) {
      this.setState({ syncModalIsOpen: true })
    }
  }

  render () {
    var activity = _.get(this.props, 'video.activity')
    if (activity) {
      var connectStravaButton =
        <Button title={activity.name} onPress={this.onPressStravaConnect} />

      var startAt = _.get(this.props, 'video.startAt')
      var label = 'Sync to Activity'
      if (startAt) {
        label = moment(startAt).format()
      }
      var timeButton =
        <Button title={label} onPress={() => this.setState({ syncModalIsOpen: true })} />
    } else {
      connectStravaButton =
        <Button
          onPress={this.onPressStravaConnect}
          title='Connect Strava'
          color='#fc4c02' />
    }

    if (activity && this.props.rawVideoData) {
      var syncModal =
        <SyncModalContainer
          isOpen={this.state.syncModalIsOpen}
          onClose={this._onCloseSyncModal}
          onSave={this._onSaveSyncModal}
          rawVideoData={this.props.rawVideoData}
          activity={activity} />
    }

    if (activity) {
      var activityStreams =
        <ActivityStreamsContainer activity={activity} />
    }

    return (
      <View style={styles.videoView}>
        <VideoPlayer video={this.props.rawVideoData} />
        {connectStravaButton}
        {activityStreams}
        {timeButton}
        <StravaActivitySelectModal
          isOpen={this.state.stravaActivityModalIsOpen}
          onSelect={this._onSelectStravaActivity}
          onClose={this._onCloseStravaActivityModal} />
        {syncModal}
      </View>
    )
  }
})

const styles = {
  videoView: {
    flex: 1,
    flexDirection: 'column'
  }
}

VideoView.propTypes = {
  rawVideoData: PropTypes.object.isRequired,
  video: PropTypes.object
}
