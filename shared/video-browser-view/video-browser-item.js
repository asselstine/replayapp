import Video from 'react-native-video'
import PropTypes from 'prop-types'
import React from 'react'
import {
  TouchableOpacity
} from 'react-native'

export const VideoBrowserItem = React.createClass({
  onPress (e) {
    console.log('VideoBrowserItem onPress: ', this.props.video)
    if (this.props.onPress) { this.props.onPress(e, this.props.video) }
  },

  togglePlay () {
    if (this.state.paused) {
      this.player.seek(0)
    }
    this.setState({ paused: !this.state.paused })
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
      <TouchableOpacity
        onPress={this.onPress}>
        <Video
          source={this.props.video}
          ref={(ref) => { this.player = ref }}
          paused={this.state.paused}
          resizeMode='cover'
          style={style}
          />
      </TouchableOpacity>
    )
  }
})

VideoBrowserItem.propTypes = {
  video: PropTypes.object.isRequired,
  onPress: PropTypes.func
}
