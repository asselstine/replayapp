import React, {
  Component
} from 'react'
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import { SegmentEffort } from '../../../segment-effort'
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
import { RaceGraph } from '../../race-graph'
import { SegmentModal } from './segment-modal'
import _ from 'lodash'

export class ActivityOverlay extends Component {
  constructor (props) {
    super(props)
    var segmentEffort = _.first(this.visibleSegmentEffortsFromProps(props))
    this.state = _.merge({}, {
      segmentEffort: segmentEffort,
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
      altitudeStream: [],
      segmentEffortModalOpen: false
    })
    this.currentTimeActivity = this.props.currentTimeActivity
    this.onChangeSegmentEffort = this.onChangeSegmentEffort.bind(this)
    this.selectSegmentEffort = this.selectSegmentEffort.bind(this)
    this.onSelectSegmentEffort = this.onSelectSegmentEffort.bind(this)
    this.onCloseSelectSegment = this.onCloseSelectSegment.bind(this)
    this.checkCurrentSegmentEffort = this.checkCurrentSegmentEffort.bind(this)
    this.updateLeaderboardComparisonData = this.updateLeaderboardComparisonData.bind(this)
    this.updateLeaderboardData = this.updateLeaderboardData.bind(this)
    this._hideOverlay = this._hideOverlay.bind(this)
    this.onActivityTimeChange = this.onActivityTimeChange.bind(this)
    this.activeRefs = new ActiveRefs()
    if (segmentEffort) {
      this.onChangeSegmentEffort()
    }
  }

  selectSegmentEffort () {
    this.setState({ segmentEffortModalOpen: true })
  }

  onCloseSelectSegment () {
    this.setState({ segmentEffortModalOpen: false })
  }

  onSelectSegmentEffort (segmentEffort) {
    this.setState({
      segmentEffort: segmentEffort,
      segmentEffortModalOpen: false
    }, this.onChangeSegmentEffort)
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
    // console.log(this.props.segmentEfforts.length, props.segmentEfforts.length)
    if (!this.props.segmentEfforts.length && props.segmentEfforts.length) {
      this.setState({segmentEffort: _.first(this.visibleSegmentEffortsFromProps(props))}, this.onChangeSegmentEffort)
    }
  }

  componentWillUnmount () {
    this.listener.remove()
  }

  updateCurrentTime (currentTimeActivity) {
    this.currentTimeActivity = currentTimeActivity
    // this.checkCurrentSegmentEffort()
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
      this._showOverlay(overlay)
    }
  }

  currentSegmentEffort () {
    return _.last(this.props.segmentEfforts)
  }

  visibleSegmentEfforts () {
    return this.visibleSegmentEffortsFromProps(this.props)
  }

  visibleSegmentEffortsFromProps (props) {
    if (!props.video || !props.segmentEfforts.length) { return [] }
    var videoStartAt = Video.startAt(props.video)
    var videoEndAt = Video.endAt(props.video)
    return props.segmentEfforts.reduce((matching, segmentEffort) => {
      var dates = SegmentEffort.dates(segmentEffort)
      if (dates.start.isSameOrBefore(videoEndAt) &&
          dates.end.isSameOrAfter(videoStartAt)) {
        matching.push(segmentEffort)
      }
      return matching
    }, [])
  }

  segmentEffortOverlapsCurrentTime (segmentEffort) {
    var currentTime = this.currentTimeActivity
    var times = _.get(this.props, 'streams.time.data')
    return (
      times &&
      times[segmentEffort.start_index] <= currentTime &&
      times[segmentEffort.end_index] >= currentTime
    )
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
    if (!_.get(this.props, 'segmentEffort.segment.id') ||
        !_.get(this.state, 'leaderboardEntry.effort_id')) { return }
    var segmentId = this.state.segmentEffort.segment.id
    var segmentEffortId = this.state.segmentEffort.id
    var versusEffortId = this.state.leaderboardEntry.effort_id
    var segmentEffort = this.state.segmentEffort
    ActivityService.retrieveEffortComparison(this.state.segmentEffort.activity.id, segmentId, segmentEffortId, versusEffortId)
                   .then(() => {
                     var versusDeltaTimes = SegmentsFinder.findDeltaTimes(store.getState(), segmentId, segmentEffortId, versusEffortId) || []
                     var segmentEffortTimeStream = ActivitiesFinder.findSegmentEffortTimeStream(store.getState(), segmentEffort)
                     this.setState({
                       versusDeltaTimes,
                       segmentEffortTimeStream
                     })
                   })
  }

  onActivityTimeChange (time) {
    // this.resetOverlayHideTimeout()
    if (this.props.onActivityTimeChange) {
      this.props.onActivityTimeChange(time)
    }
  }

  buildStreamGraph (overlayData, timeStream) {
    return (
      <StreamOverlay
        ref={(ref) => this.activeRefs.add(ref)}
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

  formatVelocity (streamTime) {
    return `${round(Activity.velocityAt(this.props.streams, streamTime), 1)} km/h`
  }

  formatAltitude (streamTime) {
    return `${Activity.altitudeAt(this.props.streams, streamTime)} m`
  }

  render () {
    this.activeRefs.clear()

    switch (this.state.streamOverlay) {
      case 'velocity':
        var streams = this.interpolateStreams(this.props)
        var streamGraphOverlay = this.buildStreamGraph(streams.velocityStream,
                                                       streams.timeStream)
        break
      case 'altitude':
        streams = this.interpolateStreams(this.props)
        streamGraphOverlay = this.buildStreamGraph(streams.altitudeStream,
                                                   streams.timeStream)
        break
      case 'leaderboardComparison':
        streamGraphOverlay =
          <RaceGraph
            ref={(ref) => this.activeRefs.add(ref)}
            timeStream={this.state.segmentEffortTimeStream}
            deltaTimeStream={this.state.versusDeltaTimes}
            showLabel={false}
            width='100%'
            height={100}
            onStreamTimeChange={this.onActivityTimeChange}
            onStreamTimeChangeStart={this.props.onActivityTimeChangeStart}
            onStreamTimeChangeEnd={this.props.onActivityTimeChangeEnd}
            videoStreamStartTime={Video.streamStartAt(this.props.video)}
            videoStreamEndTime={Video.streamEndAt(this.props.video)} />
        break
    }

    if (streamGraphOverlay) {
      var graphStyle = {
        opacity: this.state.streamOverlayProgress
      }
      var dimissStyle = _.merge({}, styles.dismissalOverlay, {
        opacity: this.state.streamOverlayProgress
      })
      var graph =
        <Animated.View style={graphStyle}>
          {streamGraphOverlay}
        </Animated.View>
      var dismissalOverlay =
        <TouchableWithoutFeedback
          onPress={() => { this._hideOverlay() }}>
          <Animated.View style={dimissStyle} />
        </TouchableWithoutFeedback>
    }

    var rank = _.get(this.state, 'athleteLeaderboardEntry.rank', '?')
    var total = _.get(this.state, 'leaderboardCount') || '?'

    if (this.state.segmentEffort) {
      var overlap = this.segmentEffortOverlapsCurrentTime(this.state.segmentEffort)
      if (overlap) {
        var labelStyle = styles.segmentNameActive
      } else {
        var labelStyle = styles.segmentNameInactive
      }
      var segmentEffortTitle =
        <TouchableOpacity style={styles.segmentEffortTitleContainer} onPress={this.selectSegmentEffort}>
          <Text style={[labelStyle, styles.segmentName, styles.overlayBottomItem]}>
            <FontAwesome style={styles.telemetryIcon} name='flag-checkered' />
            <Text> {this.state.segmentEffort.name}</Text>
          </Text>
          <Text style={styles.rank}>{rank} | {total}</Text>
        </TouchableOpacity>
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
        pointerEvents='box-none'>
        {dismissalOverlay}
        <View style={{flex: 1}} pointerEvents='box-none'>
          <View style={styles.overlayTop} pointerEvents='box-none'>
            <View style={styles.overlayTopLeft} pointerEvents='box-none'>
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
            <View style={styles.overlayTopRight} pointerEvents='box-none'>
              {activityMap}
            </View>
          </View>
          <View style={styles.overlayMiddle} pointerEvents='box-none'>
            {graph}
          </View>
          <View style={styles.overlayBottom} pointerEvents='box-none'>
            {segmentEffortTitle}
            <View style={{...styles.overlayBottomItem, ...styles.versusTelemetryContainer}} pointerEvents='box-none'>
              {versusSelect}
            </View>
          </View>
          <SegmentModal
            segmentEfforts={this.visibleSegmentEfforts()}
            isOpen={this.state.segmentEffortModalOpen}
            onSelect={this.onSelectSegmentEffort}
            onClose={this.onCloseSelectSegment} />
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

  segmentEffortTitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },

  rank: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: 'white',
    padding: 5,
    fontWeight: '700'
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

  dismissalOverlay: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: '150%',
    height: '200%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
  },

  graphItem: {
    flex: 1,
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

  segmentNameActive: {
    backgroundColor: '#ffa500',
    color: 'black',
  },

  segmentNameInactive: {
    backgroundColor: 'gray',
    color: 'black',
  },

  segmentName: {
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
  streams: {},
  segmentEfforts: []
}

reactMixin(ActivityOverlay.prototype, TimerMixin)
