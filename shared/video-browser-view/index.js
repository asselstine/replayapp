import React from 'react'
import Video from 'react-native-video'
import _ from 'lodash'
import {
  ActivityIndicator,
  CameraRoll,
  ListView,
  StyleSheet,
  Text,
  View
} from 'react-native'

export const VideoBrowserView = React.createClass({
  getInitialState () {
    var dataSource = new ListView.DataSource({rowHasChanged: this._rowHasChanged})
    return {
      assets: [],
      lastCursor: null,
      noMore: false,
      loadingMore: false,
      dataSource: dataSource
    }
  },

  componentDidMount () {
    this.fetch()
  },

  _rowHasChanged () {
  },

  fetch () {
    const fetchParams = {
      first: 5,
      groupTypes: 'All',
      assetType: 'Videos'
    }
    if (this.state.lastCursor) {
      fetchParams.after = this.state.lastCursor
    }
    CameraRoll.getPhotos(fetchParams)
      .then((response) => {
        var assets = response.edges
        var newState = {}

        if (!response.page_info.has_next_page) {
          newState.noMore = true
        }

        if (assets.length > 0) {
          newState.lastCursor = response.page_info.end_cursor
          newState.assets = this.state.assets.concat(assets)
          newState.dataSource = this.state.dataSource.cloneWithRows(
            newState.assets
          )
        }

        this.setState(newState)
      })
  },

  _onEndReached () {
    if (!this.state.noMore) {
      this.fetch()
    }
  },

  _renderRow (rowData, sectionID, rowID) {
    console.log('!!!!VIDEO: ', rowData)
    let image = rowData.node.image
    let style = _.merge(styles.video, {
      aspectRatio: (image.height * 1.0) / image.width,
      width: '100%'
    })
    return (
      <View style={styles.videoContainer}>
        <Video
          source={{uri: image.uri}}
          resizeMode='cover'
          style={style}
          />
      </View>
    )
  },

  _renderFooter () {
    if (!this.state.noMore) {
      return <ActivityIndicator />
    }
    return null
  },

  render () {
    return (
      <ListView
        renderRow={this._renderRow}
        renderFooter={this._renderFooter}
        onEndReached={this._onEndReached}
        dataSource={this.state.dataSource} />
    )
  }
})

// Later on in your styles..
var styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  video: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
})
