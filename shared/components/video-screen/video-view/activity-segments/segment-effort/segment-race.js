import React, {
  Component
} from 'react'
import {
  View,
  Text
} from 'react-native'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Strava } from '../../../../../strava'
import { RaceGraph } from './race-graph'

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
    this.updateCompareEfforts = this.updateCompareEfforts.bind(this)
  }

  componentDidMount () {
    var segmentId = this.props.segmentEffort.segment.id
    this.retrieveSegmentEffortStream()
    Strava
      .retrieveLeaderboard(segmentId)
      .then((response) => {
        response.json().then((json) => {
          // console.log(`Retreived leaderboard for ${segmentId}: with ${json.entries.length} entry `, json.entries[0])
          this.setState({
            versusSegmentEffortId: json.entries[0].effort_id
          }, this.updateCompareEfforts)
        })
      })
  }

  updateCompareEfforts () {
    if (this.state.versusSegmentEffortId) {
      Strava
        .compareEfforts(this.props.segmentEffort.segment.id, this.props.segmentEffort.id, this.state.versusSegmentEffortId)
        .then((response) => {
          // console.log(response)
          response.json().then((json) => {
            // console.log('compare efforts response: ', json)
            this.setState({
              versusDeltaTimes: json.delta_time
            })
          })
        })
    }
  }

  retrieveSegmentEffortStream () {
    Strava.retrieveSegmentEffortStream(this.props.segmentEffort.id).then((response) => {
      response.json().then((json) => {
        var streams = _.reduce(json, (map, stream) => {
          map[stream.type] = stream
          return map
        }, {})
        this.setState({
          times: streams.time.data,
          distances: streams.distance.data,
          moving: streams.moving.data
        }, this._updateDeltaTimes)
      })
    })
  }

  render () {
    if (this.state.versusSegmentEffort) {
      var versusTitle =
        <View style={{flex: 1}}>
          <Text>You VS KOM</Text>
        </View>
    }
    if (this.state.versusDeltaTimes && this.state.distances) {
      var versusDeltaTimes =
        <RaceGraph
          eventEmitter={this.props.eventEmitter}
          timeStream={this.state.times}
          deltaTimeStream={this.state.versusDeltaTimes}
          onStreamTimeChange={this.props.onStreamTimeChange}
          width='100%'
          height='200' />
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
  segmentEffort: PropTypes.object.isRequired,
  eventEmitter: PropTypes.object.isRequired,
  onStreamTimeChange: PropTypes.func
}
