import React, {
  PureComponent
} from 'react'
import {
  TouchableHighlight,
  Image
} from 'react-native'
import Video from 'react-native-video'
import PropTypes from 'prop-types'

export class RawVideoItem extends PureComponent {
  componentWillMount () {
  }

  componentWillUnmount () {
  }

  onLoadStart (event) {
  }

  onLoad (event) {
  }

  render () {
    return (
      <TouchableHighlight
        onPress={() => this.props.onPressVideo(this.props.rawVideoData)}
        style={styles.videoContainer}>
        <Image
          source={this.props.rawVideoData.image}
          resizeMode='cover'
          style={styles.video} />
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
    aspectRatio: 1.0,
    zIndex: 8888
  },

  video: {
    width: '100%',
    height: '100%',
    zIndex: 9999
  }
}
