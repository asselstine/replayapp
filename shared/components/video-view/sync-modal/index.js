import React, { Component } from 'react'
import {
  Modal,
  TouchableHighlight,
  Text,
  View,
  Slider,
  StyleSheet
} from 'react-native'
import PropTypes from 'prop-types'
import Video from 'react-native-video'
import MapView from 'react-native-maps'
import { Strava } from '../../../strava'
import _ from 'lodash'
import { receiveStream } from '../../../actions/streams-actions'
import { store } from '../../../store'

export class SyncModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      paused: true,
      duration: 0,
      orientation: 'landscape',
      width: 1,
      height: 1
    }
    this.onLoad = this.onLoad.bind(this)
    this.onPressVideo = this.onPressVideo.bind(this)
    this._onValueChangeVideo = this._onValueChangeVideo.bind(this)
  }

  onLoad (e) {
    this.setState({
      duration: e.duration,
      orientation: e.naturalSize.orientation,
      width: e.naturalSize.width,
      height: e.naturalSize.height
    })
  }

  onPressVideo (e) {
    if (this.state.paused) {
      this.player.seek(0)
    }
    this.setState({ paused: !this.state.paused })
  }

  _onValueChangeVideo (value) {
    this.player.seek(value * (this.state.duration || 0))
  }

  componentDidMount () {
    this.retrieveStream(this.props)
    this.checkRegion(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.checkRegion(nextProps)
  }

  retrieveStream (props) {
    if (!_.get(props, 'activity.id')) {
      return
    }
    Strava
      .retrieveStream(props.activity.id)
      .then((response) => {
        response.json().then((data) => {
          store.dispatch(receiveStream(props.activity.id, data))
        })
      })
  }

  checkRegion (props) {
    if (props.latlngStream && !this.state.region) {
      var region = this.region(props)
      this.setState({ region: region })
    }
  }

  latLngs () {
    return _.map(_.get(this.props, 'latlngStream.data', []), (pair) => {
      return {
        latitude: pair[0],
        longitude: pair[1]
      }
    })
  }

  region (props) {
    var data = _.get(props, 'latlngStream.data', [])
    var lats = _.map(data, (pair) => pair[0])
    var longs = _.map(data, (pair) => pair[1])
    var minLat = _.min(lats)
    var minLong = _.min(longs)
    var maxLat = _.max(lats)
    var maxLong = _.max(longs)
    var region = {
      latitude: minLat,
      longitude: minLong,
      latitudeDelta: maxLat - minLat,
      longitudeDelta: maxLong - minLong
    }
    return region
  }

  render () {
    let latLngs = this.latLngs()
    let aspectRatio = (this.state.width * 1.0) / this.state.height
    let videoStyle = {
      width: '100%',
      aspectRatio: aspectRatio,
      maxHeight: 200
    }

    if (latLngs.length) {
      var polyLine =
        <MapView.Polyline coordinates={latLngs} />
    }

    if (this.props.rawVideoData) {
      var video =
        <Video
          source={this.props.rawVideoData}
          onLoad={this.onLoad}
          ref={(ref) => { this.player = ref }}
          paused={this.state.paused}
          style={videoStyle}
          resizeMode='fill'
          />
    }
    if (this.state.region) {
      var mapView =
        <MapView
          style={styles.map}
          region={this.state.region}
          onRegionChange={(region) => { this.setState({ region: region }) }}
        >
          {polyLine}
        </MapView>
    }

    return (
      <Modal
        animationType='slide'
        transparent={false}
        visible={this.props.isOpen}
        onRequestClose={this.props.onClose}>
        {video}
        <Slider onValueChange={this._onValueChangeVideo} />
        {mapView}
        <View style={{marginTop: 22}}>
          <TouchableHighlight onPress={this.props.onClose}>
            <Text>Cancel</Text>
          </TouchableHighlight>
        </View>
      </Modal>
    )
  }
}

SyncModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSet: PropTypes.func.isRequired,
  rawVideoData: PropTypes.object.isRequired,
  activity: PropTypes.object.isRequired,
  latlngStream: PropTypes.object,
  timeStream: PropTypes.object
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 300,
    backgroundColor: 'transparent'
  }
})
