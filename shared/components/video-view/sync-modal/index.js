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
import { linear } from '../../../streams'
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
      mapCurrentLatLng: null
    }
    this.mapTimeOffset = 0
    this.videoTimeOffset = 0
    this.onLoad = this.onLoad.bind(this)
    this.onPressVideo = this.onPressVideo.bind(this)
    this._onValueChangeVideo = this._onValueChangeVideo.bind(this)
    this._onValueChangeMap = _.throttle(this._onValueChangeMap.bind(this), 50)
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
    var offset = this.mapTimeOffset - this.videoTimeOffset
    var activityStartAt = moment(this.props.activity.start_date)
    var videoStartAt = activityStartAt.clone().add(offset, 's')
    // var format = 'YYYY-MM-DDTHH:mm:ss.SSSZ'
    // console.debug('Activity start: ', activityStartAt.format(format), ' videoStartAt: ', videoStartAt.format(format))
    this.props.onSave(videoStartAt)
  }

  _onValueChangeVideo (value) {
    var position = value * (this.state.duration || 0)
    this.player.seek(position)
    this.videoTimeOffset = position
  }

  _onValueChangeMap (value) {
    var mapTimeOffset = this.timeOffsetFromFraction(value)
    var mapCurrentLatLng = this.latLngAtTime(this.mapTime(mapTimeOffset))
    this.mapTimeOffset = mapTimeOffset
    if (this.lastAnimation) { this.lastAnimation.stop() }
    this.lastAnimation = this.positionCircleCoordinates.timing(_.merge({}, mapCurrentLatLng, { duration: 50 }))
    this.lastAnimation.start()
  }

  componentDidMount () {
    this.retrieveStream(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (_.get(this.props, 'activity.id') !== _.get(nextProps, 'activity.id')) {
      this.polyLine = null
      this.positionCircleCoordinates = null
      this.marker = null
      this.retrieveStream(nextProps)
    }
  }

  retrieveStream (props) {
    if (!_.get(props, 'activity.id')) {
      return
    }
    Strava
      .retrieveStream(props.activity.id)
      .then((response) => {
        response.json().then((data) => {
          console.log(`retrieveStream for ${props.activity.name} is: `, data[0].data.length)
          store.dispatch(receiveStream(props.activity.id, data))
        })
      })
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

  render () {
    let aspectRatio = (this.state.width * 1.0) / this.state.height
    let videoStyle = {
      width: '100%',
      aspectRatio: aspectRatio,
      maxHeight: 200
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

    let latLngs = this.latLngs()
    if (latLngs.length) {
      if (!this.positionCircleCoordinates) {
        this.positionCircleCoordinates = new MapView.AnimatedRegion({ latitude: latLngs[0].latitude, longitude: latLngs[0].longitude })
      }

      if (!this.polyLine) {
        this.polyLine =
          <MapView.Polyline coordinates={latLngs} />
      }
    }

    if (this.positionCircleCoordinates && !this.marker) {
      this.marker =
        <MapView.Marker.Animated
          coordinate={this.positionCircleCoordinates} />
    }

    var mapView =
      <MapView
        ref={(ref) => { this.mapRef = ref }}
        onLayout={() => { this.mapRef.fitToElements(false) }}
        style={styles.map}
      >
        {this.polyLine}
        {this.marker}
      </MapView>

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
