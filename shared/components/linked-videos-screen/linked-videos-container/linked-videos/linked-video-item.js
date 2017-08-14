import React, {
  PureComponent
} from 'react'
import {
  TouchableHighlight,
  Image
} from 'react-native'
import PropTypes from 'prop-types'

export class LinkedVideoItem extends PureComponent {
  constructor (props) {
    super(props)
    this._onPress = this._onPress.bind(this)
    this._onLongPress = this._onLongPress.bind(this)
  }

  _onPress () {
    this.props.onPress(this.props.video)
  }

  _onLongPress () {
    this.props.onLongPress(this.props.video)
  }

  render () {
    return (
      <TouchableHighlight
        onPress={this._onPress}
        onLongPress={this._onLongPress}
        style={styles.videoContainer}>
        <Image
          source={this.props.video.imageSource}
          resizeMode='cover'
          style={styles.video}
          />
      </TouchableHighlight>
    )
  }
}

LinkedVideoItem.propTypes = {
  onPress: PropTypes.func.isRequired,
  onLongPress: PropTypes.func.isRequired,
  video: PropTypes.object
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
