import React, {
  PureComponent
} from 'react'
import {
  TouchableHighlight
} from 'react-native'
import Video from 'react-native-video'
import PropTypes from 'prop-types'

export class RawVideoItem extends PureComponent {
  render () {
    console.log('renderitem: ', this.props.rawVideoData.localIdentifier)
    return (
      <TouchableHighlight
        onPress={() => this.props.onPressVideo(this.props.rawVideoData)}
        style={styles.videoContainer}>
        <Video
          source={this.props.rawVideoData.video}
          paused
          resizeMode='cover'
          style={styles.video}
          />
      </TouchableHighlight>
    )
  }
}

RawVideoItem.propTypes = {
  onPressVideo: PropTypes.func.isRequired,
  rawVideoData: PropTypes.object.isRequired
}

const styles = {
  videoContainer: {
    width: '50%',
    aspectRatio: 1.0
  },

  video: {
    width: '100%',
    height: '100%'
  }
}
