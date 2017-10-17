import React, {
  Component
} from 'react'
import {
  TouchableOpacity,
  Text,
  Animated,
  View
} from 'react-native'
import PropTypes from 'prop-types'
import { store } from '../../../store'
import { Activity } from '../../../activity'
import { ActivityService } from '../../../services/activity-service'
import { SegmentService } from '../../../services/segment-service'
import { SegmentsFinder } from '../../../finders/segments-finder'
import { ActivitiesFinder } from '../../../finders/activities-finder'
import { round } from '../../../round'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import Icon from 'react-native-vector-icons/Ionicons'
import { StreamOverlay } from './stream-overlay'
import { VersusDetailContainer } from './versus-detail-container'
import { VersusTimeContainer } from './versus-detail/versus-time-container'
import { VersusTime } from './versus-detail/versus-time'
import { VersusSelect } from './versus-detail/versus-select'
import { SegmentLeaderboardSelect } from './segment-leaderboard-select'
import { RaceGraph } from '../../video-screen/video-view/activity-segments/segment-effort-item/segment-race/race-graph'
import _ from 'lodash'

export class ActivityOverlay extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentTimeActivity: props.currentTimeActivity,
      streamOverlay: false,
      streamOverlayProgress: new Animated.Value(0),
      leaderboardEntry: null,
      leaderboardEntries: [],
      versusDeltaTimes: [],
      segmentEffortTimeStream: []
    }
    this.onChangeSegmentEffort = this.onChangeSegmentEffort.bind(this)
    this.checkCurrentSegmentEffort = this.checkCurrentSegmentEffort.bind(this)
    this.updateLeaderboardComparisonData = this.updateLeaderboardComparisonData.bind(this)
    this.updateLeaderboardData = this.updateLeaderboardData.bind(this)
  }

  componentDidMount () {
    ActivityService.retrieveStreams(this.props.activity.id)
    ActivityService.retrieveActivity(this.props.activity.id)
    this.listener = this.props.eventEmitter.addListener('progressActivityTime', this.updateCurrentTime.bind(this))
  }

  componentWillUnmount () {
    this.listener.remove()
  }

  updateCurrentTime (currentTimeActivity) {
    this.setState({currentTimeActivity: currentTimeActivity}, this.checkCurrentSegmentEffort)
    if (this._velocityOverlay) {
      this._velocityOverlay.updateCurrentTimeActivity(currentTimeActivity)
    }
    if (this._raceOverlay) {
      this._raceOverlay.onStreamTimeProgress(currentTimeActivity)
    }
  }

  _hideOverlay () {
    Animated.timing(
      this.state.streamOverlayProgress,
      {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }
    ).start(() => {
      this.setState({ streamOverlay: false })
    })
  }

  _showOverlay (overlay) {
    this.setState({ streamOverlay: overlay }, () => {
      Animated.timing(
        this.state.streamOverlayProgress,
        {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }
      ).start()
    })
  }

  _toggleOverlay (overlay) {
    if (overlay === this.state.streamOverlay) { // if same overlay
      this._hideOverlay()
    } else {
      this._showOverlay(overlay)
    }
  }

  currentSegmentEffort () {
    var currentTime = this.state.currentTimeActivity
    var times = _.get(this.props, 'streams.time.data')
    return _.first(this.props.segmentEfforts.reduce((matchingSegmentEfforts, segmentEffort) => {
      if (times &&
          times[segmentEffort.start_index] <= currentTime &&
          times[segmentEffort.end_index] >= currentTime) {
            matchingSegmentEfforts.push(segmentEffort)
      }
      return matchingSegmentEfforts
    }, []))
  }

  checkCurrentSegmentEffort () {
    var segmentEffort = this.currentSegmentEffort()
    // console.log('currentSegmentEffort: ', this.state.currentTimeActivity, _.get(segmentEffort, 'name'))
    if (segmentEffort != this.state.segmentEffort) {
      // console.log('SEGMENT EFFORT CHANGED !!!!!!!!!!!!!', segmentEffort.id)
      this.setState({ segmentEffort }, this.onChangeSegmentEffort)
    }
  }

  onChangeSegmentEffort () {
    if (this.state.segmentEffort) {
      SegmentService.retrieveLeaderboard(this.state.segmentEffort.segment.id)
                    .then(this.updateLeaderboardData)
    }
  }

  updateLeaderboardData () {
    var leaderboardEntries = SegmentsFinder.findLeaderboardEntries(store.getState(), this.state.segmentEffort.segment.id)
    var leaderboardEntry = _.first(leaderboardEntries)
    // console.log('updateLeaderboardData: ', leaderboardEntries.length)
    this.setState({
      leaderboardEntry,
      leaderboardEntries
    }, this.updateLeaderboardComparisonData)
  }

  onSelectLeaderboardEntry (leaderboardEntry) {
    this.setState({
      leaderboardEntry
    }, this.updateLeaderboardComparisonData)
  }

  updateLeaderboardComparisonData () {
    if (!(this.state.segmentEffort && this.state.leaderboardEntry)) { return }
    var segmentId = this.state.segmentEffort.segment.id
    var segmentEffortId = this.state.segmentEffort.id
    var versusEffortId = this.state.leaderboardEntry.effort_id
    SegmentService.retrieveEffortComparison(segmentId, segmentEffortId, versusEffortId)
                  .then(() => {
                    var versusDeltaTimes = SegmentsFinder.findDeltaTimes(store.getState(), segmentId, segmentEffortId, versusEffortId) || []
                    var segmentEffortTimeStream = ActivitiesFinder.findSegmentEffortTimeStream(store.getState(), this.state.segmentEffort)
                    this.setState({
                      versusDeltaTimes,
                      segmentEffortTimeStream
                    })
                  })
  }

  buildStreamGraph (streamOverlayStyle, overlayData, timeStream) {
    return (
      <StreamOverlay
        ref={(ref) => { this._velocityOverlay = ref }}
        activityStartTime={this.props.activityStartTime}
        activityEndTime={this.props.activityEndTime}
        currentTimeActivity={this.props.currentTimeActivity}
        timeStream={timeStream}
        dataStream={overlayData}
        onActivityTimeChange={this.props.onActivityTimeChange} />
    )
  }

  render () {
    var velocity = round(Activity.velocityAt(this.props.streams, this.state.currentTimeActivity), 1)
    var altitude = `${Activity.altitudeAt(this.props.streams, this.state.currentTimeActivity)} m`

    var streamOverlayStyle = {
      opacity: this.state.streamOverlayProgress
    }

    switch (this.state.streamOverlay) {
      case 'velocity':
        var velocityOverlay = this.buildStreamGraph(streamOverlayStyle,
                                                this.props.streams.velocity_smooth.data,
                                                this.props.streams.time.data)
        break
      case 'altitude':
        velocityOverlay = this.buildStreamGraph(streamOverlayStyle,
                                                this.props.streams.altitude.data,
                                                this.props.streams.time.data)
        break
      case 'leaderboardComparison':
        velocityOverlay =
          <RaceGraph
            ref={(ref) => { this._raceOverlay = ref }}
            timeStream={this.state.segmentEffortTimeStream}
            deltaTimeStream={this.state.versusDeltaTimes}
            width='100%'
            height={100}
            onStreamTimeChange={this.props.onActivityTimeChange} />
        break
    }

    if (this.state.segmentEffort) {
      var segmentEffortComparison =
        <View style={{...styles.overlayItem, ...styles.overlaySplitItem, ...styles.overlayButton}}>
          <Text style={{...styles.segmentEffort}}>{this.state.segmentEffort.name}</Text>
        </View>
    }

    if (this.state.segmentEffort) {
      if (this.state.leaderboardEntry) {
        var versusTime =
          <TouchableOpacity onPress={() => this._toggleOverlay('leaderboardComparison')}>
            <VersusTime
              segmentEffort={this.state.segmentEffort}
              segmentEffortTimeStream={this.state.segmentEffortTimeStream}
              versusLeaderboardEntry={this.state.leaderboardEntry}
              versusDeltaTimes={this.state.versusDeltaTimes}
              currentStreamTime={this.state.currentTimeActivity} />
          </TouchableOpacity>
      }
      var versusSelect =
        <View style={styles.versusContainer}>
          {versusTime}
          <VersusSelect onSelectLeaderboardEntry={(entry) => { this.onSelectLeaderboardEntry(entry) }} leaderboardEntries={this.state.leaderboardEntries}>
            <Text>{_.get(this.state.leaderboardEntry, 'athlete_name', 'Select Athlete')}</Text>
            <Icon name='md-arrow-dropdown' style={styles.opponentIcon}/>
          </VersusSelect>
        </View>
    }

    return (
      <Animated.View
        style={{...styles.overlay, ...this.props.style}}
        pointerEvents={this.props.pointerEvents}>
        <View style={styles.overlayItemContainer}>
          <View style={styles.overlayStream}>
            <Animated.View style={streamOverlayStyle}>
              {velocityOverlay}
            </Animated.View>
          </View>
          <View style={{...styles.overlayData, ...styles.overlayBottom}}>
            <View style={{...styles.overlaySmallBar, ...styles.contentCenter}}>
              <View style={styles.overlayItem}>
                {segmentEffortComparison}
                {versusSelect}
                <TouchableOpacity style={{...styles.dataItem, ...styles.overlayButton}} onPress={() => { this._toggleOverlay('velocity') }}>
                  <MaterialCommunityIcon style={{...styles.overlayText, ...styles.icon}} name='speedometer' />
                  <Text style={{...styles.overlayText, ...styles.textWidth4}}>{velocity}</Text>
                  <Text style={styles.overlayText}>km/h</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{...styles.dataItem, ...styles.overlayButton}} onPress={() => { this._toggleOverlay('altitude') }}>
                  <MaterialCommunityIcon style={{...styles.overlayText, ...styles.icon}} name='altimeter' />
                  <Text style={styles.overlayText}>{altitude}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    )
  }
}

const styles = {
  overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0
  },

  segmentEffort: {
    backgroundColor: 'white',
    color: 'black',
    fontSize: 16
  },

  overlayItemContainer: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center'
  },

  overlayStream: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end'
  },

  overlayData: {
    flex: 0,
    flexDirection: 'row'
  },

  overlayButton: {
    padding: 10
  },

  overlayItem: {
    flex: 1,
    flexDirection: 'row'
  },

  dataItem: {
    flex: 1,
    flexDirection: 'row'
  },

  overlaySplitItem: {
    flex: 2
  },

  overlayText: {
    color: 'white',
    backgroundColor: 'transparent',
    fontSize: 16
  },

  icon: {
    fontSize: 18,
    paddingRight: 4
  },

  textWidth4: {
    width: 36
  },

  overlaySmallBar: {
    flex: 1,
    flexDirection: 'row'
  },

  overlayBottom: {
    alignItems: 'flex-end'
  },

  contentCenter: {
    justifyContent: 'flex-start'
  },

  versusContainer: {
    flexDirection: 'row'
  },

  opponentIcon: {
    fontSize: 18,
  }
}

ActivityOverlay.propTypes = {
  eventEmitter: PropTypes.object.isRequired,
  currentTimeActivity: PropTypes.any.isRequired,
  activity: PropTypes.object.isRequired,
  onActivityTimeChange: PropTypes.func,
  activityStartTime: PropTypes.any,
  activityEndTime: PropTypes.any,
  style: PropTypes.any,
  pointerEvents: PropTypes.any,
  streams: PropTypes.object,
  segmentEfforts: PropTypes.array
}

ActivityOverlay.defaultProps = {
  streams: {}
}
