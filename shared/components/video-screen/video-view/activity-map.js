import React, {
  Component
} from 'react'
import {
  StyleSheet,
  View
} from 'react-native'
import MapView from 'react-native-maps'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { linear, linearIndex } from '../../../streams'
import { closestPoint } from '../../../closest-point'
import * as colours from '../../../colours'

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
    this.onStreamTimeProgressSubscriber = this.props.eventEmitter.addListener('onStreamTimeProgress', this.onStreamTimeProgress)
  }

  componentWillUnmount () {
    this.onStreamTimeProgressSubscriber.remove()
  }

  onStreamTimeProgress (streamTime) {
    this.setCoordinates(streamTime)
  }

  componentWillReceiveProps (nextProps) {
    if (_.get(this.props, 'activity.id') !== _.get(nextProps, 'activity.id')) {
      this.polyLine = null
      this.positionCircleCoordinates = null
      this.marker = null
    }
    if (_.get(this.props, 'streams') !== _.get(nextProps, 'streams')) {
      this._latLngs = null
    }
    if (this.props.streamTime !== nextProps.streamTime) {
      this.setCoordinates(nextProps.streamTime)
    }
  }

  setCoordinates (streamTime) {
    if (this.positionCircleCoordinates) {
      var mapCurrentLatLng = this.latLngAtTime(this.boundStreamTime(streamTime))
      if (this.lastAnimation) { this.lastAnimation.stop() }
      this.lastAnimation = this.positionCircleCoordinates.timing(_.merge({}, mapCurrentLatLng, { duration: 50 }))
      this.lastAnimation.start()
    }
  }

  latLngAtTime (time) {
    var data = _.get(this.props, 'streams.latlng.data', [])
    var timeData = _.get(this.props, 'streams.time.data', [])
    var lats = _.map(data, (pair) => pair[0])
    var longs = _.map(data, (pair) => pair[1])
    return {
      latitude: linear(time, timeData, lats),
      longitude: linear(time, timeData, longs)
    }
  }

  boundStreamTime (streamTime) {
    var timeData = _.get(this.props, 'streams.time.data', [])
    return Math.max(timeData[0], Math.min(streamTime, timeData[timeData.length - 1]))
  }

  timeOffsetFromFraction (fraction) {
    var timeData = _.get(this.props, 'streams.time.data', [])
    if (!timeData.length) {
      return 0
    }
    var timeSpan = timeData[timeData.length - 1] - timeData[0]
    var time = timeSpan * fraction
    return time
  }

  mapTime (mapTimeOffset) {
    var timeData = _.get(this.props, 'streams.time.data', [])
    if (!timeData.length) {
      return 0
    }
    return timeData[0] + mapTimeOffset
  }

  latLngs () {
    this._latLngs = this._latLngs ||
      _.map(_.get(this.props, 'streams.latlng.data', []), (pair) => {
        return {
          latitude: pair[0],
          longitude: pair[1]
        }
      })
    return this._latLngs
  }

  onPressMapView (event) {
    var closest = closestPoint(event.nativeEvent.coordinate, this.latLngs())
    var streamTime = linearIndex(closest.startIndex + closest.fraction, _.get(this.props, 'streams.time.data', []))
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
    let latLngs = this.latLngs()
    if (latLngs.length) {
      if (!this.positionCircleCoordinates) {
        var mapCurrentLatLng = this.latLngAtTime(this.boundStreamTime(this.props.streamTime))
        this.positionCircleCoordinates = new MapView.AnimatedRegion(mapCurrentLatLng)
      }

      if (!this.polyLine) {
        this.polyLine =
          <MapView.Polyline
            ref={(ref) => { this.polylineRef = ref }}
            strokeColor={colours.BRAND}
            strokeWidth={2}
            coordinates={latLngs} />
      }

      if (this.positionCircleCoordinates && !this.marker) {
        this.marker =
          <MapView.Marker.Animated
            coordinate={this.positionCircleCoordinates} />
      }
    }

    if (this.polyLine && this.marker) {
      var mapView =
        <MapView
          onPress={(event) => { this.onPressMapView(event) }}
          pitchEnabled={false}
          ref={(ref) => { this.mapRef = ref }}
          onLayout={this.onLayout.bind(this)}
          style={styles.map}
        >
          {this.polyLine}
          {this.marker}
        </MapView>
    }

    return (
      <View style={this.props.style}>
        {mapView}
      </View>
    )
  }
}

ActivityMap.propTypes = {
  activity: PropTypes.object.isRequired,
  streams: PropTypes.object,
  streamTime: PropTypes.number,
  eventEmitter: PropTypes.object.isRequired,
  onStreamTimeChange: PropTypes.func
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
