import RNPhotosFramework from 'react-native-photos-framework'
import React, { PureComponent } from 'react'
import Video from 'react-native-video'
import PropTypes from 'prop-types'
import Orientation from 'react-native-orientation'
import { PhotosFramework } from '../../../../services/photos-framework'

import {
  FlatList,
  TouchableHighlight,
  Alert
} from 'react-native'

export class RawVideoList extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      assets: [],
      lastCursor: null,
      noMore: false,
      loaded: false
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

  refetch () {
    this.setState({
      assets: [],
      noMore: false,
      lastCursor: null
    }, () => { this.fetch() })
  }

  _keyExtractor (item, index) {
    return item.localIdentifier
  }

  _onEndReached () {
    if (!this.state.noMore && this.state.loaded) {
      this.fetch()
    }
  }

  _renderItem ({item, index, separators}) {
    return (
      <TouchableHighlight
        onPress={() => this.props.onPressVideo(item)}
        style={styles.videoContainer}>
        <Video
          source={item.video}
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

  componentWillUnmount () {
    if (this._subscription) {
      this._subscription.remove()
    }
  }

  componentDidMount () {
    this.authorize()
  }

  authorize () {
    RNPhotosFramework.requestAuthorization().then((response) => {
      if (response.isAuthorized) {
        PhotosFramework.init()
        this._subscription = PhotosFramework.emitter().addListener('onLibraryChange', this.refetch.bind(this))
        this.setState({ loaded: true }, this.fetch.bind(this))
      } else {
        this.requestAuthorization()
      }
    })
  }

  requestAuthorization () {
    Alert.alert(
      'We need to access your videos',
      'Please update your settings!',
      [
        { text: 'OK', onPress: this.authorize.bind(this) }
      ]
    )
  }

  render () {
    return (
      <FlatList
        data={this.state.assets}
        numColumns={2}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor}
        onEndReached={this._onEndReached}
        style={this.props.style} />
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

RawVideoList.propTypes = {
  onPressVideo: PropTypes.func.isRequired,
  style: PropTypes.any
}

RawVideoList.navigationOptions = {
  title: 'Add Video'
}
