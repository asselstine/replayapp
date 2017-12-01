import React, {
  Component
} from 'react'
import {
  StyleSheet,
  Animated,
  View
} from 'react-native'
import MapView from 'react-native-maps'
import _ from 'lodash'
import PropTypes from 'prop-types'
import {
  valueToIndex,
  linear,
  linearIndex
} from '../streams'
import { closestPoint } from '../closest-point'
import * as colours from '../colours'

export class ActivityMap extends Component {
  constructor (props) {
    super(props)
    this.onStreamTimeProgress = this.onStreamTimeProgress.bind(this)
    this.lastPolyPressTime = 0
    this.state = {}
  }

  componentDidMount () {
    if (this.props.streamTime) {
      this.setCoordinates(this.props.streamTime)
    }
    this.onStreamTimeProgressSubscriber = this.props.eventEmitter.addListener('progressActivityTime', this.onStreamTimeProgress)
  }

  componentWillUnmount () {
    this.onStreamTimeProgressSubscriber.remove()
  }

  onStreamTimeProgress (streamTime) {
    this.setCoordinates(streamTime)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.streamTime !== nextProps.streamTime) {
      this.setCoordinates(nextProps.streamTime)
      this.recenter()
    }
  }

  setCoordinates (streamTime) {
    if (this.positionCircleCoordinates) {
      var mapCurrentLatLng = this.latLngAtTime(this.boundStreamTime(streamTime))
      if (!mapCurrentLatLng) { return }
      if (this.lastAnimation) { this.lastAnimation.stop() }
      this.positionCircleCoordinates
      this.lastAnimation = this.positionCircleCoordinates.timing(_.merge({}, mapCurrentLatLng, { duration: 0 }))
      this.lastAnimation.start()
    }
  }

  latLngAtTime (time) {
    var data = _.get(this.props, 'streams.latlng.data', [])
    var timeData = _.get(this.props, 'streams.time.data', [])
    if (!data.length || !timeData.length) { return null }
    var lats = _.map(data, (pair) => pair[0])
    var longs = _.map(data, (pair) => pair[1])
    var latitude = linear(time, timeData, lats)
    var longitude = linear(time, timeData, longs)
    if (!latitude || !longitude) { return null }
    var result = {
      latitude,
      longitude
    }
    return result
  }

  boundStreamTime (streamTime) {
    var timeData = this.timeStream()
    return Math.max(timeData[0], Math.min(streamTime, timeData[timeData.length - 1]))
  }

  timeStream () {
    return _.get(this.props, 'streams.time.data', [])
  }

  timeOffsetFromFraction (fraction) {
    var timeData = this.timeStream()
    if (!timeData.length) {
      return 0
    }
    var timeSpan = timeData[timeData.length - 1] - timeData[0]
    var time = timeSpan * fraction
    return time
  }

  mapTime (mapTimeOffset) {
    var timeData = this.timeStream()
    if (!timeData.length) {
      return 0
    }
    return timeData[0] + mapTimeOffset
  }

  latLngStream () {
    return _.get(this.props, 'streams.latlng.data', [])
  }

  latLngs () {
    return this.reshapeLatLngs( this.latLngStream() )
  }

  reshapeLatLngs (latLngs) {
    return _.map(latLngs, (pair) => {
      return {
        latitude: pair[0],
        longitude: pair[1]
      }
    })
  }

  videoLatLngs () {
    var startIndex = valueToIndex(this.props.videoStreamStartTime, this.timeStream())
    var endIndex = valueToIndex(this.props.videoStreamEndTime, this.timeStream())
    var latLngs = []
    var start = this.latLngAtTime(this.props.videoStreamStartTime)
    if (start) { latLngs.push(start) }
    latLngs = latLngs.concat( this.reshapeLatLngs(_.slice(this.latLngStream(), Math.ceil(startIndex), Math.ceil(endIndex))) )
    var end = this.latLngAtTime(this.props.videoStreamEndTime)
    if (end) { latLngs.push(end) }
    var _videoLatLngs = latLngs

    return _videoLatLngs
  }

  onPressMapView (event) {
    var closest = closestPoint(event.nativeEvent.coordinate, this.latLngs())
    var streamTime = linearIndex(closest.startIndex + closest.fraction, this.timeStream())
    if (this.props.onStreamTimeChange) {
      this.props.onStreamTimeChange(streamTime)
    }
  }

  recenter () {
    if (this.mapRef) {
      this.mapRef.fitToElements(false)
    }
  }

  onLayout () {
    this.recenter()
  }

  render () {
    console.log('RENDERRRRRRRRR', this.props.streamTime)

    let latLngs = this.latLngs()
    var videoLatLngs = this.videoLatLngs()

    if (!this.positionCircleCoordinates) {
      var mapCurrentLatLng = this.latLngAtTime(this.boundStreamTime(this.props.streamTime))
      this.positionCircleCoordinates = new MapView.AnimatedRegion(mapCurrentLatLng)
    }

    return (
      <Animated.View style={this.props.style}>
        <MapView
          onPress={(event) => { this.onPressMapView(event) }}
          pitchEnabled={false}
          ref={(ref) => { this.mapRef = ref }}
          onLayout={this.onLayout.bind(this)}
          style={styles.map}
        >
          <MapView.Marker.Animated
            coordinate={this.positionCircleCoordinates} />
          <MapView.Polyline
            strokeColor='pink'
            strokeWidth={2}
            coordinates={latLngs} />
          <MapView.Polyline
            strokeColor={colours.BRAND}
            strokeWidth={3}
            coordinates={videoLatLngs} />
        </MapView>
      </Animated.View>
    )
  }
}

ActivityMap.propTypes = {
  activity: PropTypes.object.isRequired,
  streams: PropTypes.object,
  streamTime: PropTypes.number,
  eventEmitter: PropTypes.object.isRequired,
  onStreamTimeChange: PropTypes.func,
  videoStreamStartTime: PropTypes.number,
  videoStreamEndTime: PropTypes.number
}

ActivityMap.defaultProps = {
  style: {
    flex: 1
  }
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent'
  }
})
