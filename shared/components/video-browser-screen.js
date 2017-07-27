import React from 'react'
import { VideoBrowserView } from './video-browser-view'
import { Provider } from 'react-redux'
import { store } from '../store'
import { newVideo } from '../actions/video-actions'
import { NavigationActions } from 'react-navigation'

export const VideoBrowserScreen = React.createClass({
  navigationOptions: {
    title: 'Browse'
  },

  onPressVideo (video) {
    store.dispatch(newVideo(video))
    var action = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'LinkedVideos' }),
        NavigationActions.navigate({ routeName: 'Video', params: { localIdentifier: video.video.uri } })
      ]
    })
    this.props.navigation.dispatch(action)
  },

  render () {
    return (
      <Provider store={store}>
        <VideoBrowserView onPressVideo={this.onPressVideo} />
      </Provider>
    )
  }
})
