import Video from 'react-native-video'
import React from 'react'
import {
  TouchableOpacity
} from 'react-native'

export const VideoBrowserItem = React.createClass({
  play () {
    console.log('tap')
    this.player.seek(0)
    this.setState({ paused: false })
  },

  getInitialState () {
    return {
      paused: true
    }
  },

  render () {
    let width = 100
    let height = 100
    let style = {
      aspectRatio: (width * 1.0) / height,
      width: '100%'
    }
    return (
      // <TouchableOpacity onPress={this.play}>
        <Video
          source={this.props.video}
          ref={(ref) => { this.player = ref }}
          paused={this.state.paused}
          resizeMode='cover'
          style={style}
          />
      // </TouchableOpacity>
    )
  }
})
