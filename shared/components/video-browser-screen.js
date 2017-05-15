import React from 'react'
import { VideoBrowserView } from './video-browser-view'
import { Provider } from 'react-redux'
import { store } from '../store'

export const VideoBrowserScreen = React.createClass({
  navigationOptions: {
    title: 'Browse'
  },

  onPressVideo (e, video) {
    this.props.navigation.navigate('Video', { rawVideoData: video })
  },

  render () {
    return (
      <Provider store={store}>
        <VideoBrowserView onPressVideo={this.onPressVideo} />
      </Provider>
    )
  }
})
