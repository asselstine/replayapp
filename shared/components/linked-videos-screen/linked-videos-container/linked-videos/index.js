import React, {
  Component
} from 'react'
import {
  FlatList,
  Text
} from 'react-native'
import PropTypes from 'prop-types'
import { LinkedVideoItem } from './linked-video-item'
import { PhotosFramework } from '../../../../services/photos-framework'
import Orientation from 'react-native-orientation'
import { AddButton } from './add-button'

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
    if (item == 'add') {
      var item = <AddButton onSelectRawVideo={this.props.onAddRawVideo}/>
    } else {
      item =
        <LinkedVideoItem video={item} onPress={this._onPress} onLongPress={this._onLongPress} />
    }
    return (
      item
    )
  }

  _keyExtractor (item, index) {
    if (item == 'add') {
      return -1
    } else {
      return item.rawVideoData.localIdentifier
    }
  }

  render () {
    var videos = []
    if (this.state.showVideos) {
      videos = this.props.videos
    }

    return (
      <FlatList
        data={['add'].concat(videos)}
        numColumns={2}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor} />
    )
  }
}

LinkedVideos.propTypes = {
  videos: PropTypes.array.isRequired,
  onPressVideo: PropTypes.func.isRequired,
  onLongPressVideo: PropTypes.func.isRequired,
  onAddRawVideo: PropTypes.func.isRequired
}
