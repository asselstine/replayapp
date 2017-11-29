import React, {
  Component
} from 'react'
import {
  TouchableOpacity,
  Text,
  Animated,
  View
} from 'react-native'
import { ActiveRefs } from '../../../active-refs'
import { ActiveText } from '../../active-text'
import TimerMixin from 'react-timer-mixin'
import reactMixin from 'react-mixin'
import PropTypes from 'prop-types'
import { store } from '../../../store'
import { ActivityMap } from '../../activity-map'
import { Activity } from '../../../activity'
import { interpolate } from '../../../streams'
import { Video } from '../../../video'
import { ActivityService } from '../../../services/activity-service'
import { SegmentService } from '../../../services/segment-service'
import { SegmentsFinder } from '../../../finders/segments-finder'
import { ActivitiesFinder } from '../../../finders/activities-finder'
import { round } from '../../../round'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
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
    this.state = _.merge({}, {
      streamOverlay: false,
      streamOverlayProgress: new Animated.Value(0),
      leaderboardCount: 0,
      athleteLeaderboardEntry: null,
      leaderboardEntry: null,
      leaderboardEntries: [],
      versusDeltaTimes: [],
      segmentEffortTimeStream: [],
      timeStream: [],
      velocityStream: [],
      altitudeStream: []
    })
    this.currentTimeActivity = this.props.currentTimeActivity
    this.onChangeSegmentEffort = this.onChangeSegmentEffort.bind(this)
    this.checkCurrentSegmentEffort = this.checkCurrentSegmentEffort.bind(this)
    this.updateLeaderboardComparisonData = this.updateLeaderboardComparisonData.bind(this)
    this.updateLeaderboardData = this.updateLeaderboardData.bind(this)
    this._hideOverlay = this._hideOverlay.bind(this)
    this.onActivityTimeChange = this.onActivityTimeChange.bind(this)
    this._raceOverlayRef = this._raceOverlayRef.bind(this)
    this.activeRefs = new ActiveRefs()
  }

  interpolateStreams (props) {
    if (!props.streams) { return {} }
    var newVelocity = interpolate({ times: props.streams.time.data, values: props.streams.velocity_smooth.data })
    var newAltitude = interpolate({ times: props.streams.time.data, values: props.streams.altitude.data })
    return {
      timeStream: newVelocity.times,
      velocityStream: newVelocity.values,
      altitudeStream: newAltitude.values
    }
  }

  componentDidMount () {
    ActivityService.retrieveStreams(this.props.activity.id)
    ActivityService.retrieveActivity(this.props.activity.id)
    this.listener = this.props.eventEmitter.addListener('progressActivityTime', this.updateCurrentTime.bind(this))
  }

  componentWillReceiveProps (props) {
  }

  componentWillUnmount () {
    this.listener.remove()
  }

  updateCurrentTime (currentTimeActivity) {
    this.currentTimeActivity = currentTimeActivity
    this.checkCurrentSegmentEffort()
    if (this._streamOverlay) {
      this._streamOverlay.updateCurrentTimeActivity(currentTimeActivity)
    }
    if (this._raceOverlay) {
      this._raceOverlay.onStreamTimeProgress(currentTimeActivity)
    }
    this.activeRefs.onStreamTimeProgress(currentTimeActivity)
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
    if (this.state.streamOverlay !== overlay) {
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
  }

  _toggleOverlay (overlay) {
    if (overlay === this.state.streamOverlay) { // if same overlay
      this._hideOverlay()
    } else {
      this.resetOverlayHideTimeout()
      this._showOverlay(overlay)
    }
  }

  currentSegmentEffort () {
    var currentTime = this.currentTimeActivity
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
    if (segmentEffort !== this.state.segmentEffort) {
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
    if (!this.state.segmentEffort) { return }
    var leaderboardEntries = SegmentsFinder.findLeaderboardEntries(store.getState(), this.state.segmentEffort.segment.id)
    var leaderboardEntry = _.first(leaderboardEntries)
    var leaderboardCount = SegmentsFinder.findLeaderboardCount(store.getState(), this.state.segmentEffort.segment.id)
    var athleteLeaderboardEntry = _.find(leaderboardEntries, (leaderboardEntry) => {
      return leaderboardEntry.athlete_id == this.props.activity.athlete.id
    })
    this.setState({
      leaderboardCount,
      leaderboardEntry,
      leaderboardEntries,
      athleteLeaderboardEntry
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
    var segmentEffort = this.state.segmentEffort
    SegmentService.retrieveEffortComparison(segmentId, segmentEffortId, versusEffortId)
                  .then(() => {
                    var versusDeltaTimes = SegmentsFinder.findDeltaTimes(store.getState(), segmentId, segmentEffortId, versusEffortId) || []
                    var segmentEffortTimeStream = ActivitiesFinder.findSegmentEffortTimeStream(store.getState(), segmentEffort)
                    this.setState({
                      versusDeltaTimes,
                      segmentEffortTimeStream
                    })
                  })
  }

  resetOverlayHideTimeout () {
    if (this.timeout) {
      this.clearTimeout(this.timeout)
    }
    this.timeout = this.setTimeout(this._hideOverlay, 3000)
  }

  onActivityTimeChange (time) {
    this.resetOverlayHideTimeout()
    if (this.props.onActivityTimeChange) {
      this.props.onActivityTimeChange(time)
    }
  }

  buildStreamGraph (streamOverlayStyle, overlayData, timeStream) {
    return (
      <StreamOverlay
        ref={(ref) => { this._streamOverlay = ref }}
        activityStartTime={this.props.activityStartTime}
        activityEndTime={this.props.activityEndTime}
        currentTimeActivity={this.currentTimeActivity}
        timeStream={timeStream}
        dataStream={overlayData}
        onActivityTimeChange={this.onActivityTimeChange}
        onActivityTimeChangeStart={this.props.onActivityTimeChangeStart}
        onActivityTimeChangeEnd={this.props.onActivityTimeChangeEnd} />
    )
  }

  _raceOverlayRef (ref) {
    this._raceOverlay = ref
  }

  formatVelocity (streamTime) {
    return `${round(Activity.velocityAt(this.props.streams, streamTime), 1)} km/h`
  }

  formatAltitude (streamTime) {
    return `${Activity.altitudeAt(this.props.streams, streamTime)} m`
  }

  render () {
    this.activeRefs.clear()

    var streamOverlayStyle = {
      opacity: this.state.streamOverlayProgress
    }

    switch (this.state.streamOverlay) {
      case 'velocity':
        var streams = this.interpolateStreams(this.props)
        var streamGraphOverlay = this.buildStreamGraph(streamOverlayStyle,
                                                streams.velocityStream,
                                                streams.timeStream)
        break
      case 'altitude':
        streams = this.interpolateStreams(this.props)
        streamGraphOverlay = this.buildStreamGraph(streamOverlayStyle,
                                                streams.altitudeStream,
                                                streams.timeStream)
        break
      case 'leaderboardComparison':
        streamGraphOverlay =
          <RaceGraph
            ref={this._raceOverlayRef}
            timeStream={this.state.segmentEffortTimeStream}
            deltaTimeStream={this.state.versusDeltaTimes}
            width='100%'
            height={100}
            onStreamTimeChange={this.onActivityTimeChange}
            onStreamTimeChangeStart={this.props.onActivityTimeChangeStart}
            onStreamTimeChangeEnd={this.props.onActivityTimeChangeEnd}
            videoStreamStartTime={Video.streamStartAt(this.props.video)}
            videoStreamEndTime={Video.streamEndAt(this.props.video)} />
        break
    }

    var rank = _.get(this.state, 'athleteLeaderboardEntry.rank', '?')
    var total = _.get(this.state, 'leaderboardCount') || '?'

    if (this.state.segmentEffort) {
      var segmentEffortTitle =
        <View>
          <Text style={{...styles.segmentName, ...styles.overlayBottomItem}}>
            <FontAwesome style={styles.telemetryIcon} name='flag-checkered' />
            <Text> {this.state.segmentEffort.name} {rank} | {total}</Text>
          </Text>
        </View>
    }

    if (this.state.segmentEffort) {
      if (this.state.leaderboardEntry) {
        var versusTime =
          <TouchableOpacity
            onPress={() => this._toggleOverlay('leaderboardComparison')}
            style={{...styles.telemetryItem, ...styles.overlayBottomItem}}
            >
            <View style={styles.telemetryIconContainer}>
              <MaterialCommunityIcon style={styles.telemetryIcon} name='clock' />
            </View>
            <VersusTime
              ref={(ref) => this.activeRefs.add(ref)}
              positiveStyle={styles.versusDeltaTimePositive}
              negativeStyle={styles.versusDeltaTimeNegative}
              segmentEffort={this.state.segmentEffort}
              segmentEffortTimeStream={this.state.segmentEffortTimeStream}
              versusLeaderboardEntry={this.state.leaderboardEntry}
              versusDeltaTimes={this.state.versusDeltaTimes}
              currentStreamTime={this.currentTimeActivity}
              style={styles.telemetryLabel} />
          </TouchableOpacity>
      }

      var versusSelect =
        <View style={{flexDirection: 'row'}}>
          <VersusSelect
            style={{...styles.telemetryItem, ...styles.overlayBottomItem}}
            onSelectLeaderboardEntry={(entry) => { this.onSelectLeaderboardEntry(entry) }}
            leaderboardEntries={this.state.leaderboardEntries}>
            <View style={styles.telemetryIconContainer}>
              <FontAwesome style={styles.telemetryIcon} name='arrows-h' />
            </View>
            <View
              style={styles.versusOpponent}>
              <Text style={styles.telemetryLabel}>{_.get(this.state, 'leaderboardEntry.rank', 0)}. {_.get(this.state.leaderboardEntry, 'athlete_name', 'Select Athlete')}</Text>
            </View>
          </VersusSelect>
          {versusTime}
        </View>
    }

    var activityMap
    // activityMap =
    //   <ActivityMap
    //     style={styles.map}
    //     eventEmitter={this.props.eventEmitter}
    //     activity={this.props.activity}
    //     streams={this.props.streams}
    //     streamTime={this.props.currentTimeActivity}
    //     onStreamTimeChange={this.props.onActivityTimeChange}
    //     videoStreamStartTime={Video.streamStartAt(this.props.video)}
    //     videoStreamEndTime={Video.streamEndAt(this.props.video)} />

    return (
      <Animated.View
        style={{...styles.overlay, ...this.props.style}}
        pointerEvents={this.props.pointerEvents}
        >
        <View style={styles.overlayTop}>
          <View style={styles.overlayTopLeft}>
            <View style={styles.titleContainer}>
              <Text style={{...styles.activityName}}>{this.props.activity.name}</Text>
            </View>
            <TouchableOpacity style={{...styles.telemetryItem, ...styles.overlayTopItem}} onPress={() => { this._toggleOverlay('velocity') }}>
              <View style={styles.telemetryIconContainer}>
                <MaterialCommunityIcon style={styles.telemetryIcon} name='speedometer' />
              </View>
              <ActiveText
                style={styles.telemetryLabel}
                ref={(ref) => this.activeRefs.add(ref)}
                streamTime={this.currentTimeActivity}
                format={(streamTime) => this.formatVelocity(streamTime)} />
            </TouchableOpacity>
            <TouchableOpacity style={{...styles.telemetryItem, ...styles.overlayTopItem}} onPress={() => { this._toggleOverlay('altitude') }}>
              <View style={styles.telemetryIconContainer}>
                <MaterialCommunityIcon style={styles.telemetryIcon} name='altimeter' />
              </View>
              <ActiveText
                style={styles.telemetryLabel}
                ref={(ref) => this.activeRefs.add(ref)}
                streamTime={this.currentTimeActivity}
                format={(streamTime) => this.formatAltitude(streamTime)} />
            </TouchableOpacity>
          </View>
          <View style={styles.overlayTopRight}>
            {activityMap}
          </View>
        </View>
        <View style={styles.overlayMiddle}>
          <Animated.View style={streamOverlayStyle}>
            {streamGraphOverlay}
          </Animated.View>
        </View>
        <View style={styles.overlayBottom}>
          {segmentEffortTitle}
          <View style={{...styles.overlayBottomItem, ...styles.versusTelemetryContainer}}>
            {versusSelect}
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
    left: 0,
    flexDirection: 'column',
  },

  titleContainer: {
    marginBottom: 5,
  },

  map: {
    width: 100,
    height: 100
  },

  overlayTop: {
    flex: 1,
    flexDirection: 'row',
    padding: 5
  },

  overlayTopLeft: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },

  overlayTopRight: {
    flex: 2,
    alignItems: 'flex-end'
  },

  overlayBottom: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: 5
  },

  overlayTopItem: {
    marginBottom: 5
  },

  overlayBottomItem: {
    marginTop: 5,
    marginRight: 5
  },

  telemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    padding: 1,
    paddingRight: 10
  },

  telemetryIconContainer: {
    backgroundColor: 'white',
    borderRadius: 50,
    width: 24,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  telemetryIcon: {
    color: 'black',
    backgroundColor: 'transparent',
    fontSize: 18,
    textAlign: 'center',
  },

  telemetryLabel: {
    marginLeft: 5,
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },

  telemetrySecondaryLabel: {
    marginLeft: 10
  },

  activityName: {
    color: 'white',
    backgroundColor: 'transparent',
    textShadowColor: 'black',
    textShadowOffset: {
      width: 1,
      height: 1
    },
    textShadowRadius: 10,
    fontWeight: '700',
    fontSize: 16,
  },

  segmentName: {
    backgroundColor: '#ffa500',
    color: 'black',
    padding: 4,
    fontWeight: '700'
  },

  versusContainer: {
    marginLeft: 5,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center'
  },

  versusDeltaTime: {
    fontSize: 14,
    backgroundColor: 'transparent',
    color: 'white'
  },

  versusOpponent: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  versusOpponentTitle: {
    fontSize: 14,
    backgroundColor: 'transparent',
  },

  versusTelemetryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
}

ActivityOverlay.propTypes = {
  eventEmitter: PropTypes.object.isRequired,
  currentTimeActivity: PropTypes.any.isRequired,
  activity: PropTypes.object.isRequired,
  onActivityTimeChange: PropTypes.func,
  onActivityTimeChangeStart: PropTypes.func,
  onActivityTimeChangeEnd: PropTypes.func,
  activityStartTime: PropTypes.any,
  activityEndTime: PropTypes.any,
  style: PropTypes.any,
  pointerEvents: PropTypes.any,
  streams: PropTypes.object,
  segmentEfforts: PropTypes.array,
  video: PropTypes.object
}

ActivityOverlay.defaultProps = {
  streams: {}
}

reactMixin(ActivityOverlay.prototype, TimerMixin)
