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
import { Video } from '../../../../../../video'
import { RaceGraph } from '../../../../../race-graph'
import { SegmentEffortSelectModal } from '../../../../../segment-effort-select-modal'
import Icon from 'react-native-vector-icons/Ionicons'
import { track } from '../../../../../../analytics'
import dpiNormalize from '../../../../../../dpi-normalize'
import Alert from '../../../../../../alert'
import { ActivityService } from '../../../../../../services/activity-service'

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
    Strava.retrieveLeaderboard(segmentId)
      .then((response) => {
        if (Strava.responseOk(response)) {
          response.json().then((json) => {
            this.setState({
              versusLeaderboardEntry: json.entries[0],
              leaderboard: json.entries
            }, this.updateCompareEfforts)
          })
        }
      })
  }

  updateCompareEfforts () {
    if (!_.get(this.props, 'segmentEffort.segment.id') ||
        !_.get(this.state, 'versusLeaderboardEntry.effort_id')) { return }
    var activityId = this.props.segmentEffort.activity.id
    var segmentId = this.props.segmentEffort.segment.id
    var segmentEffortId = this.props.segmentEffort.id
    var versusEffortId = this.state.versusLeaderboardEntry.effort_id
    ActivityService.retrieveEffortComparison(activityId,
                                             segmentId,
                                             segmentEffortId,
                                             versusEffortId)
                   .then(() => {
                     var versusDeltaTimes = SegmentsFinder.findDeltaTimes(store.getState(), segmentId, segmentEffortId, versusEffortId) || []
                     this.setState({
                       versusDeltaTimes,
                     })
                   })
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
    track({
      event: 'VideoView Select Leaderboard Entry'
    })
  }

  openSegmentEffortModal () {
    this.setState({
      segmentEffortModalOpen: true
    })
  }

  wasResponseError (response) {
    return !ActivityService.activityResponseOk(response, this.props.segmentEffort.activity.id)
  }

  retrieveSegmentEffortStream () {
    Strava.retrieveSegmentEffortStream(this.props.segmentEffort.id).then((response) => {
      if (!this.wasResponseError(response)) {
        response.json().then((json) => {
          var streams = _.reduce(json, (map, stream) => {
            map[stream.type] = stream
            return map
          }, {})
          this.setState({
            times: streams.time.data
          })
        })
      }
    })
  }

  render () {
    if (this.state.versusLeaderboardEntry) {
      var versusTitle =
        <View style={styles.title}>
          <Text style={styles.vsText}>You VS </Text>
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
          onStreamTimeChangeStart={this.props.onStreamTimeChangeStart}
          onStreamTimeChangeEnd={this.props.onStreamTimeChangeEnd}
          videoStreamStartTime={Video.streamStartAt(this.props.video)}
          videoStreamEndTime={Video.streamEndAt(this.props.video)}
          showLabel={true}
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
      <View style={{flex: 1, paddingLeft: 10, paddingRight: 10}}>
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
  onStreamTimeChange: PropTypes.func,
  onStreamTimeChangeStart: PropTypes.func,
  onStreamTimeChangeEnd: PropTypes.func,
  video: PropTypes.object
}

const styles = {
  title: {
    flexDirection: 'row',
    flex: 1,
    // marginLeft: 10
  },
  opponentButton: {
    flex: 1,
    flexDirection: 'row'
  },
  vsText: {
    fontSize: dpiNormalize(14),
  },

  opponentTitle: {
    fontSize: dpiNormalize(14),
    fontWeight: '800',
    paddingRight: 4,
  },
  opponentIcon: {
    fontSize: dpiNormalize(16),
  }
}
