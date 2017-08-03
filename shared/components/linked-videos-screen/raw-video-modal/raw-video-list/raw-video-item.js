import React, {
  PureComponent
} from 'react'
import {
  TouchableHighlight
} from 'react-native'
import Video from 'react-native-video'
import PropTypes from 'prop-types'

export class RawVideoItem extends PureComponent {
  componentWillMount () {
    // console.log('componentWillMount: ', this.props.rawVideoData.localIdentifier)
  }

  componentWillUnmount () {
    // console.log('componentWillUnmount: ', this.props.rawVideoData.localIdentifier)
  }

  onLoadStart (event) {
    // console.log('onLoadStart: ', this.props.rawVideoData.localIdentifier, event)
  }

  onLoad (event) {
    // console.log('onLoad: ', this.props.rawVideoData.localIdentifier, event)
  }

  render () {
    // console.log('renderitem: ', this.props.rawVideoData.localIdentifier)
    return (
      <TouchableHighlight
        onPress={() => this.props.onPressVideo(this.props.rawVideoData)}
        style={styles.videoContainer}>
        <Video
          source={this.props.rawVideoData.video}
          onLoadStart={this.onLoadStart.bind(this)}
          onLoad={this.onLoad.bind(this)}
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
    aspectRatio: 1.0,
    zIndex: 8888
  },

  video: {
    width: '100%',
    height: '100%',
    zIndex: 9999
  }
}
