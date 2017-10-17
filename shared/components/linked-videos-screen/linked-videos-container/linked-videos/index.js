import React, {
  Component
} from 'react'
import {
  FlatList
} from 'react-native'
import PropTypes from 'prop-types'
import { LinkedVideoItem } from './linked-video-item'
import { PhotosFramework } from '../../../../services/photos-framework'
import Orientation from 'react-native-orientation'

export class LinkedVideos extends Component {
  constructor (props) {
    super(props)
    this._onPress = this._onPress.bind(this)
    this._onLongPress = this._onLongPress.bind(this)
    this._renderItem = this._renderItem.bind(this)
    this.state = {
      showVideos: false
    }
  }

  componentWillMount () {
    Orientation.lockToPortrait()
  }

  componentDidMount () {
    PhotosFramework.auth().then((response) => {
      if (response.isAuthorized) {
        this.setState({
          showVideos: true
        })
      }
    })
  }

  _onPress (video) {
    this.props.onPressVideo(video)
  }

  _onLongPress (video) {
    this.props.onLongPressVideo(video)
  }

  _renderItem ({item, index, separators}) {
    return (
      <LinkedVideoItem video={item} onPress={this._onPress} onLongPress={this._onLongPress} />
    )
  }

  _keyExtractor (item, index) {
    return item.rawVideoData.localIdentifier
  }

  render () {
    var videos = []
    if (this.state.showVideos) {
      videos = this.props.videos
    }

    return (
      <FlatList
        data={videos}
        numColumns={2}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor} />
    )
  }
}

LinkedVideos.propTypes = {
  videos: PropTypes.array.isRequired,
  onPressVideo: PropTypes.func.isRequired,
  onLongPressVideo: PropTypes.func.isRequired
}
