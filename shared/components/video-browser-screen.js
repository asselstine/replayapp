import React from 'react'
import { VideoBrowserView } from './video-browser-view'
import { Provider } from 'react-redux'
import { store } from '../store'
import { newVideo } from '../actions/video-actions'

export const VideoBrowserScreen = React.createClass({
  navigationOptions: {
    title: 'Browse'
  },

  onPressVideo (video) {
    store.dispatch(newVideo(video))
    this.props.navigation.navigate('Video', { videoUri: video.video.uri })
  },

  render () {
    return (
      <Provider store={store}>
        <VideoBrowserView onPressVideo={this.onPressVideo} />
      </Provider>
    )
  }
})
