import RNPhotosFramework from 'react-native-photos-framework'
import React, { PureComponent } from 'react'
import Video from 'react-native-video'
import Orientation from 'react-native-orientation'
import _ from 'lodash'

import {
  ActivityIndicator,
  FlatList,
  TouchableHighlight
} from 'react-native'

export class VideoBrowserView extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      assets: [],
      lastCursor: null,
      noMore: false
    }
    this._renderItem = this._renderItem.bind(this)
    this._onEndReached = this._onEndReached.bind(this)
  }

  fetch () {
    const fetchParams = {
      first: 40,
      groupTypes: 'All',
      assetType: 'All' // assetType: 'Videos'
    }
    if (this.state.lastCursor) {
      fetchParams.after = this.state.lastCursor
    }

    RNPhotosFramework.getAssets({
      startIndex: 0,
      endIndex: 10,
      includeMetadata: true,
      fetchOptions: {
        sourceTypes: ['userLibrary'],
        mediaTypes: ['video'],
        sortDescriptors: [
          {
            key: 'creationDate',
            ascending: false
          }
        ]
      }
    }).then((response) => {
      var newState = {}
      newState.assets = this.state.assets.concat(response.assets)
      newState.noMore = true
      this.setState(newState)
    })
  }

  _keyExtractor (item, index) {
    return item.video.uri
  }

  _onEndReached () {
    if (!this.state.noMore) {
      this.fetch()
    }
  }

  _renderItem ({item, index, separators}) {
    return (
      <TouchableHighlight
        onPress={() => this.props.onPressVideo(item)}
        style={styles.videoContainer}>
        <Video
          source={item._videoRef}
          paused
          resizeMode='cover'
          style={styles.video}
          />
      </TouchableHighlight>
    )
  }

  componentWillMount () {
    Orientation.lockToPortrait()
  }

  _renderFooter () {
    if (!this.state.noMore) {
      return <ActivityIndicator />
    }
    return null
  }

  render () {
    return (
      <FlatList
        data={this.state.assets}
        numColumns={2}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor}
        onEndReached={this._onEndReached} />
    )
  }
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

VideoBrowserView.propTypes = {
  onPressVideo: React.PropTypes.func.isRequired
}
