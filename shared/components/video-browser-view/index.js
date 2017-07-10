import RNPhotosFramework from 'react-native-photos-framework'
import React from 'react'
import { VideoBrowserItem } from './video-browser-item'

import {
  ActivityIndicator,
  ListView,
  StyleSheet
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
      first: 40,
      groupTypes: 'All',
      assetType: 'All' // assetType: 'Videos'
    }
    if (this.state.lastCursor) {
      fetchParams.after = this.state.lastCursor
    }

    RNPhotosFramework.getAssets({
      // Example props below. Many optional.
      // You can call this function multiple times providing startIndex and endIndex as
      // pagination.
      startIndex: 0,
      endIndex: 10,

      fetchOptions: {
        // Media types you wish to display. See table below for possible options. Where
        // is the image located? See table below for possible options.
        sourceTypes: ['userLibrary'], // , 'cloudShared'
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
      newState.dataSource = this.state.dataSource.cloneWithRows(
        newState.assets
      )
      newState.noMore = true
      this.setState(newState)
    })
  },

  _onEndReached () {
    if (!this.state.noMore) {
      this.fetch()
    }
  },

  _renderRow (rowData, sectionID, rowID) {
    // console.log('rowData: ', rowData)
    return (
      <VideoBrowserItem video={rowData.video} onPress={this.props.onPressVideo} />
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
        style={styles.videoContainer}
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
    flexDirection: 'column'
  }
})

VideoBrowserView.propTypes = {
  onPressVideo: React.PropTypes.func.isRequired
}
