import React, {
  Component
} from 'react'
import {
  View,
  Text
} from 'react-native'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Strava } from '../../../../strava'
import { versusDeltaTimes } from '../../../../streams'

export class SegmentRace extends Component {
  constructor (props) {
    super(props)
    this.state = {
      times: null,
      distances: null,
      versusSegmentEffort: null,
      versusTimes: null,
      versusDistances: null
    }
    // this._updateDeltaTimes = this._updateDeltaTimes.bind(this)
    this.updateCompareEfforts = this.updateCompareEfforts.bind(this)
  }

  componentDidMount () {
    var segmentId = this.props.segmentEffort.segment.id
    // this.retrieveSegmentEffortStream()
    Strava.retrieveSegmentSegmentEfforts(segmentId).then((response) => {
      response.json().then((json) => {
        this.setState({
          versusSegmentEffort: json[0]
        }, this.updateCompareEfforts)

        // this.updateCompareEfforts(json[0].id)
      })
    })
  }

  updateCompareEfforts () {
    if (this.state.versusSegmentEffort) {
      Strava
        .compareEfforts(this.props.segmentEffort.segment.id, this.props.segmentEffort.id, this.state.versusSegmentEffort.id)
        .then((response) => {
          console.log(response)
          response.json().then((json) => {
            this.setState({
              versusDeltaTimes: json.delta_time
            })
          })
        })
    }
  }
  // retrieveSegmentEffortStream () {
  //   Strava.retrieveSegmentEffortStream(this.props.segmentEffort.id).then((response) => {
  //     response.json().then((json) => {
  //       var streams = _.reduce(json, (map, stream) => {
  //         map[stream.type] = stream
  //         return map
  //       }, {})
  //       this.setState({
  //         times: streams.time.data,
  //         distances: streams.distance.data,
  //         moving: streams.moving.data
  //       }, this._updateDeltaTimes)
  //     })
  //   })
  // }
  //
  // retrieveVersusSegmentEffortStream (segmentEffortId) {
  //   Strava.retrieveSegmentEffortStream(segmentEffortId).then((response) => {
  //     response.json().then((json) => {
  //       var streams = _.reduce(json, (map, stream) => {
  //         map[stream.type] = stream
  //         return map
  //       }, {})
  //       this.setState({
  //         versusTimes: streams.time.data,
  //         versusDistances: streams.distance.data,
  //         versusMoving: streams.moving.data
  //       }, this._updateDeltaTimes)
  //     })
  //   })
  // }
  //
  // _updateDeltaTimes () {
  //   if (this.state.times && this.state.distances && this.state.versusTimes && this.state.versusDistances) {
  //     this.setState({
  //       versusDeltaTimes: versusDeltaTimes(
  //         this.state.times,
  //         this.state.distances,
  //         this.state.versusTimes,
  //         this.state.versusDistances,
  //         this.state.moving,
  //         this.state.versusMoving
  //       )
  //     }, () => {
  //       // console.log('updateDeltaTimes: ', this.state.versusDeltaTimes)
  //     })
  //   }
  // }

  render () {
    if (this.state.versusSegmentEffort) {
      var versusTitle =
        <View style={{flex: 1}}>
          <Text>You VS KOM</Text>
        </View>
    }
    if (this.state.versusDeltaTimes) {
      var versusDeltaTimes =
        <View style={{flex: 1}}>
          <Text>{this.state.versusDeltaTimes}</Text>
        </View>
    }
    return (
      <View style={{flex: 1}}>
        {versusTitle}
        {versusDeltaTimes}
      </View>
    )
  }
}

SegmentRace.propTypes = {
  segmentEffort: PropTypes.object.isRequired
}
