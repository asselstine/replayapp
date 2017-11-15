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
import {
  valueToIndex,
  linear,
  linearIndex
} from '../../../streams'
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
      this.videoPolyLine = null
      this.positionCircleCoordinates = null
      this.marker = null
    }
    if (_.get(this.props, 'streams') !== _.get(nextProps, 'streams')) {
      this._latLngs = null
      this._videoLatLngs = null
    }
    if (this.props.videoStreamEndTime !== nextProps.videoStreamEndTime) {
      this._videoLatLngs = null
      this.videoPolyLine = null
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
    this._latLngs = this._latLngs || this.reshapeLatLngs( this.latLngStream() )
    return this._latLngs
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
    if (this._videoLatLngs) { return this._videoLatLngs }
    var startIndex = valueToIndex(this.props.videoStreamStartTime, this.timeStream())
    var endIndex = valueToIndex(this.props.videoStreamEndTime, this.timeStream())
    var latLngs = []
    latLngs.push(this.latLngAtTime(this.props.videoStreamStartTime))
    latLngs = latLngs.concat( this.reshapeLatLngs(_.slice(this.latLngStream(), Math.ceil(startIndex), Math.ceil(endIndex))) )
    latLngs.push(this.latLngAtTime(this.props.videoStreamEndTime))
    this._videoLatLngs = latLngs
    return this._videoLatLngs
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
    let latLngs = this.latLngs()
    if (latLngs.length) {
      if (!this.positionCircleCoordinates) {
        var mapCurrentLatLng = this.latLngAtTime(this.boundStreamTime(this.props.streamTime))
        this.positionCircleCoordinates = new MapView.AnimatedRegion(mapCurrentLatLng)
      }

      if (!this.polyLine) {
        this.polyLine =
          <MapView.Polyline
            strokeColor='pink'
            strokeWidth={2}
            coordinates={latLngs} />
      }

      if (this.positionCircleCoordinates && !this.marker) {
        this.marker =
          <MapView.Marker.Animated
            coordinate={this.positionCircleCoordinates} />
      }
    }

    var videoLatLngs = this.videoLatLngs()
    if (videoLatLngs.length && !this.videoPolyLine) {
      this.videoPolyLine =
        <MapView.Polyline
          strokeColor={colours.BRAND}
          strokeWidth={3}
          coordinates={videoLatLngs} />
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
          {this.videoPolyLine}
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
