import React from 'react'
import { VideoBrowserView } from './video-browser-view'

export const VideoBrowserScreen = React.createClass({
  navigationOptions: {
    title: 'Browse'
  },

  render () {
    return <VideoBrowserView />
  }
})
