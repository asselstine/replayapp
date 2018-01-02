import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import dispatchTrack from '../../store/dispatch-track'
import { newVideo, removeVideo } from '../../actions/video-actions'
import rawVideoDataProperties from '../../analytics/raw-video-data-properties'
import { VideoPlayer } from '../video-player'
import EventEmitter from 'EventEmitter'
import { NavigationActions } from 'react-navigation'
import {
  View,
} from 'react-native'
import { Button } from '../button'

export class VideoPreviewScreen extends Component {
  constructor (props) {
    super(props)
    this.eventEmitter = new EventEmitter()
  }

  onAdd () {
    const { rawVideoData } = this.props.navigation.state.params
    dispatchTrack(newVideo(rawVideoData), rawVideoDataProperties(rawVideoData))
    const resetAction = NavigationActions.reset({
      index: 1,
      actions: [
        NavigationActions.navigate({ routeName: 'LinkedVideos' }),
        NavigationActions.navigate({ routeName: 'Video', params: { localIdentifier: rawVideoData.localIdentifier } }),
      ]
    })
    this.props.navigation.dispatch(resetAction)
  }

  render () {
    const { rawVideoData } = this.props.navigation.state.params
    var video = {
      rawVideoData: rawVideoData,
      videoSource: rawVideoData.video
    }

    return (
      <View style={styles.container}>
        <View style={styles.video}>
          <VideoPlayer
            playDefault={true}
            eventEmitter={this.eventEmitter}
            video={video} />
        </View>
        <View style={styles.button}>
          <Button title='Add' onPress={this.onAdd.bind(this)} />
        </View>
      </View>
    )
  }
}

VideoPreviewScreen.navigationOptions = (props) => {
  return {
    title: 'Preview'
  }
}

const styles = {
  container: {
    flexDirection: 'column',
    flex: 1,
  },

  video: {
    flex: 10,
    height: '100%',
    width: '100%',
  },

  button: {
    flex: 0,
    padding: 20
  },
}
