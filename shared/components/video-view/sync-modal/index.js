import React, { Component } from 'react'
import {
  Modal,
  Button,
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
import { linear } from '../../../interp'
import moment from 'moment'

export class SyncModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      paused: true,
      duration: 0,
      orientation: 'landscape',
      width: 1,
      height: 1,
      mapTimeOffset: 0,
      videoTimeOffset: 0,
      mapCurrentLatLng: null
    }
    this.onLoad = this.onLoad.bind(this)
    this.onPressVideo = this.onPressVideo.bind(this)
    this._onValueChangeVideo = this._onValueChangeVideo.bind(this)
    this._onValueChangeMap = _.throttle(this._onValueChangeMap.bind(this), 100)
    this._onSave = this._onSave.bind(this)
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

  _onSave () {
    var offset = this.state.mapTimeOffset - this.state.videoTimeOffset
    var activityStartAt = moment(this.props.activity.start_date)
    var videoStartAt = activityStartAt.clone().add(offset, 's')
    // var format = 'YYYY-MM-DDTHH:mm:ss.SSSZ'
    // console.debug('Activity start: ', activityStartAt.format(format), ' videoStartAt: ', videoStartAt.format(format))
    this.props.onSave(videoStartAt)
  }

  _onValueChangeVideo (value) {
    var position = value * (this.state.duration || 0)
    this.player.seek(position)
    this.setState({ videoTimeOffset: position })
  }

  _onValueChangeMap (value) {
    var mapTimeOffset = this.timeOffsetFromFraction(value)
    this.setState({
      mapTimeOffset: mapTimeOffset,
      mapCurrentLatLng: this.latLngAtTime(this.mapTime(mapTimeOffset))
    })
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

  latLngAtTime (time) {
    var data = _.get(this.props, 'latlngStream.data', [])
    var timeData = _.get(this.props, 'timeStream.data', [])
    var lats = _.map(data, (pair) => pair[0])
    var longs = _.map(data, (pair) => pair[1])
    return {
      latitude: linear(time, timeData, lats),
      longitude: linear(time, timeData, longs)
    }
  }

  timeOffsetFromFraction (fraction) {
    var timeData = _.get(this.props, 'timeStream.data', [])
    if (!timeData.length) {
      return 0
    }
    var timeSpan = timeData[timeData.length - 1] - timeData[0]
    var time = timeSpan * fraction
    return time
  }

  mapTime (mapTimeOffset) {
    var timeData = _.get(this.props, 'timeStream.data', [])
    if (!timeData.length) {
      return 0
    }
    return timeData[0] + mapTimeOffset
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

    if (this.state.mapCurrentLatLng) {
      var positionCircle =
        <MapView.Marker
          draggable
          coordinate={this.state.mapCurrentLatLng}
          onDragEnd={(e) => this.setState({ mapCurrentLatLng: e.nativeEvent.coordinate })} />
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
          ref={(ref) => { this.mapRef = ref }}
          onLayout={() => { this.mapRef.fitToElements(true) }}
          style={styles.map}
          region={this.state.region}
          onRegionChange={(region) => { this.setState({ region: region }) }}
        >
          {polyLine}
          {positionCircle}
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
        <Slider onValueChange={this._onValueChangeMap} />
        <View style={{marginTop: 22, flexDirection: 'row', flex: 1, justifyContent: 'space-between'}}>
          <Button
            style={{padding: 20}}
            onPress={this.props.onClose}
            title='Cancel'
            color='#FF0000' />
          <Button
            style={{padding: 20}}
            onPress={this._onSave}
            title='Save'
            color='#00FF00' />
        </View>
      </Modal>
    )
  }
}

SyncModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
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
