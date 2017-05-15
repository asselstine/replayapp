import React from 'react'
import { VideoBrowserView } from './video-browser-view'

export const VideoBrowserScreen = React.createClass({
  navigationOptions: {
    title: 'Browse'
  },

  onPressVideo (e, video) {
    console.log('NAVIGATE')
    this.props.navigation.navigate('Video', { video: video })
  },

  render () {
    return <VideoBrowserView onPressVideo={this.onPressVideo} />
  }
})
