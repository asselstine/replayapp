import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { VideoPlayer } from './video-player'
import {
  View,
  Button
} from 'react-native'
import { connect } from 'react-redux'
import _ from 'lodash'
import { manager } from '../oauth'
import { store } from '../store'
import * as actions from '../actions/strava-actions'

export const VideoView = connect(
  (state, ownProps) => {
    return {
      video: _.get(state, `videos[${ownProps.rawVideoData.uri}]`)
    }
  }
)(class extends Component {
  constructor (props) {
    super(props)
    this.onPressStravaConnect = this.onPressStravaConnect.bind(this)
  }

  onPressStravaConnect () {
    console.debug('authorizing strava')
    manager.authorize('strava', { scopes: 'view_private' })
      .then((response) => {
        console.log('done!: ', response)
        store.dispatch(actions.login(response.response.credentials))
        console.log('onStravaConnected: ', this.props.onStravaConnected)
        this.props.onStravaConnected()
      })
      .catch(response => console.log('could not authenticate'))
  }

  render () {
    if (!this.props.video) {
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
  video: PropTypes.object,
  onStravaConnected: PropTypes.func.isRequired
}
