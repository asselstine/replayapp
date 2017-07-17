import React, {
  PureComponent
} from 'react'
import {
  StyleSheet,
  View
} from 'react-native'
import MapView from 'react-native-maps'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { linear } from '../../streams'

export class ActivityMap extends PureComponent {
  componentDidMount () {
    if (this.props.time) {
      this.setCoordinates(this.props.time)
    }
  }

  componentWillReceiveProps (nextProps) {
    if (_.get(this.props, 'activity.id') !== _.get(nextProps, 'activity.id')) {
      this.polyLine = null
      this.positionCircleCoordinates = null
      this.marker = null
    }
    if (this.props.time !== nextProps.time) {
      this.setCoordinates(nextProps.time)
    }
  }

  setCoordinates (time) {
    if (this.positionCircleCoordinates) {
      var mapTimeOffset = this.timeOffsetFromFraction(time)
      var mapCurrentLatLng = this.latLngAtTime(this.mapTime(mapTimeOffset))
      this.mapTimeOffset = mapTimeOffset
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
    return _.map(_.get(this.props, 'streams.latlng.data', []), (pair) => {
      return {
        latitude: pair[0],
        longitude: pair[1]
      }
    })
  }

  render () {
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

    return (
      <View style={{flex: 1}}>
        <MapView
          pitchEnabled={false}
          ref={(ref) => { this.mapRef = ref }}
          onLayout={() => { this.mapRef.fitToElements(false) }}
          style={styles.map}
        >
          {this.polyLine}
          {this.marker}
        </MapView>
      </View>
    )
  }
}

ActivityMap.propTypes = {
  activity: PropTypes.object.isRequired,
  streams: PropTypes.object,
  time: PropTypes.number
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 300,
    backgroundColor: 'transparent'
  }
})
