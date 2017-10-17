import React, {
  Component
} from 'react'
import {
  View,
  TouchableOpacity,
  Text
} from 'react-native'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Strava } from '../../../../../../strava'
import { RaceGraph } from './race-graph'
import { SegmentEffortSelectModal } from '../../../../../segment-effort-select-modal'
import Icon from 'react-native-vector-icons/Ionicons'

export class SegmentRace extends Component {
  constructor (props) {
    super(props)
    this.state = {
      segmentEffortModalOpen: false,
      times: null,
      distances: null,
      leaderboard: [],
      versusSegmentEffort: null,
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
            versusLeaderboardEntry: json.entries[0],
            leaderboard: json.entries
          }, this.updateCompareEfforts)
        })
      })
  }

  updateCompareEfforts () {
    if (this.state.versusLeaderboardEntry) {
      Strava
        .compareEfforts(this.props.segmentEffort.segment.id, this.props.segmentEffort.id, this.state.versusLeaderboardEntry.effort_id)
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

  onCloseSegmentEffortModal () {
    this.setState({
      segmentEffortModalOpen: false
    })
  }

  onSelectSegmentEffort (leaderboardEntry) {
    this.setState({
      versusLeaderboardEntry: leaderboardEntry
    }, this.updateCompareEfforts)
    this.onCloseSegmentEffortModal()
  }

  openSegmentEffortModal () {
    this.setState({
      segmentEffortModalOpen: true
    })
  }

  retrieveSegmentEffortStream () {
    Strava.retrieveSegmentEffortStream(this.props.segmentEffort.id).then((response) => {
      response.json().then((json) => {
        var streams = _.reduce(json, (map, stream) => {
          map[stream.type] = stream
          return map
        }, {})
        this.setState({
          times: streams.time.data
        })
      })
    })
  }

  render () {
    if (this.state.versusLeaderboardEntry) {
      var versusTitle =
        <View style={styles.title}>
          <Text>You VS </Text>
          <TouchableOpacity onPress={() => { this.openSegmentEffortModal() }} style={styles.opponentButton}>
            <Text style={styles.opponentTitle}>{this.state.versusLeaderboardEntry.athlete_name}</Text>
            <Icon name='md-arrow-dropdown' style={styles.opponentIcon}/>
          </TouchableOpacity>
        </View>
    }
    if (this.state.versusDeltaTimes && this.state.times) {
      var versusDeltaTimes =
        <RaceGraph
          eventEmitter={this.props.eventEmitter}
          timeStream={this.state.times}
          deltaTimeStream={this.state.versusDeltaTimes}
          onStreamTimeChange={this.props.onStreamTimeChange}
          width='100%'
          height='200' />
    }

    var modal =
      <SegmentEffortSelectModal
        isOpen={this.state.segmentEffortModalOpen}
        leaderboard={this.state.leaderboard}
        onSelect={(leaderboardEntry) => { this.onSelectSegmentEffort(leaderboardEntry) }}
        onClose={() => { this.onCloseSegmentEffortModal() }} />

    return (
      <View style={{flex: 1}}>
        {versusTitle}
        {versusDeltaTimes}
        {modal}
      </View>
    )
  }
}

SegmentRace.propTypes = {
  segmentEffort: PropTypes.object.isRequired,
  eventEmitter: PropTypes.object.isRequired,
  onStreamTimeChange: PropTypes.func
}

const styles = {
  title: {
    flexDirection: 'row',
    flex: 1
  },
  opponentButton: {
    flex: 1,
    flexDirection: 'row'
  },
  opponentTitle: {
    fontWeight: '800',
    paddingRight: 4,
  },
  opponentIcon: {
    fontSize: 18,
  }
}