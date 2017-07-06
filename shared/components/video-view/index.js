import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { VideoPlayer } from '../video-player'
import {
  View,
  Button
} from 'react-native'
import { connect } from 'react-redux'
import _ from 'lodash'
import { manager } from '../../oauth'
import { store } from '../../store'
import { attachActivity } from '../../actions/video-actions'
import { login } from '../../actions/strava-actions'
import { StravaActivitySelectModal } from './strava-activity-select-modal'
import { SyncModal } from './sync-modal'

export const VideoView = connect(
  (state, ownProps) => {
    return {
      video: _.get(state, `videos[${ownProps.rawVideoData.uri}]`)
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
    this._onSetSyncModal = this._onSetSyncModal.bind(this)
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

  _onSetSyncModal () {
    console.debug('set')
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
    if (!_.get(this.props, 'video.activity')) {
      var connectStravaButton =
        <Button
          onPress={this.onPressStravaConnect}
          title='Connect Strava'
          color='#fc4c02' />
    }

    return (
      <View style={styles.videoView}>
        <VideoPlayer video={this.props.rawVideoData} />
        {connectStravaButton}
        <StravaActivitySelectModal
          isOpen={this.state.stravaActivityModalIsOpen}
          onSelect={this._onSelectStravaActivity}
          onClose={this._onCloseStravaActivityModal} />
        <SyncModal
          isOpen={this.state.syncModalIsOpen}
          onClose={this._onCloseSyncModal}
          onSet={this._onSetSyncModal}
          rawVideoData={this.props.rawVideoData}
          activity={_.get(this.props, 'video.activity')} />
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
