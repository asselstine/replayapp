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
import { Activity } from '../../../activity'
import { ActivityService } from '../../../services/activity-service'
import { round } from '../../../round'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { StreamOverlay } from './stream-overlay'
import { VersusDetailContainer } from './versus-detail-container'
import _ from 'lodash'

export class ActivityOverlay extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentTimeActivity: props.currentTimeActivity,
      streamOverlay: false,
      streamOverlayProgress: new Animated.Value(0)
    }
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
    this.setState({currentTimeActivity: currentTimeActivity})
    if (this._velocityOverlay) {
      this._velocityOverlay.updateCurrentTimeActivity(currentTimeActivity)
    }
  }

  _toggleOverlay (overlay) {
    if (overlay === this.state.streamOverlay) {
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
    } else {
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

  currentLeaderboardComparison (segmentEffort) {
    //need the leaderboard for this particular segment
    // Strava
    //   .retrieveLeaderboard(segmentEffort.segment.id)
    //   .then((response) => {
    //     response.json().then((json) => {
    //       // console.log(`Retreived leaderboard for ${segmentId}: with ${json.entries.length} entry `, json.entries[0])
    //       this.setState({
    //         versusLeaderboardEntry: json.entries[0],
    //         leaderboard: json.entries
    //       }, this.updateCompareEfforts)
    //     })
    //   })
    // VS blah
  }

  render () {
    var velocity = round(Activity.velocityAt(this.props.streams, this.state.currentTimeActivity), 1)
    var altitude = `${Activity.altitudeAt(this.props.streams, this.state.currentTimeActivity)} m`

    var streamOverlayStyle = {
      opacity: this.state.streamOverlayProgress
    }

    switch (this.state.streamOverlay) {
      case 'velocity':
        var overlayData = this.props.streams.velocity_smooth.data
        break
      case 'altitude':
        overlayData = this.props.streams.altitude.data
        break
    }

    if (this.state.streamOverlay) {
      var velocityOverlay =
        <Animated.View style={streamOverlayStyle}>
          <StreamOverlay
            ref={(ref) => { this._velocityOverlay = ref }}
            activityStartTime={this.props.activityStartTime}
            activityEndTime={this.props.activityEndTime}
            currentTimeActivity={this.props.currentTimeActivity}
            timeStream={this.props.streams.time.data}
            dataStream={overlayData}
            onActivityTimeChange={this.props.onActivityTimeChange} />
        </Animated.View>
    }

    var segmentEffort = this.currentSegmentEffort()
    if (segmentEffort) {
      var segmentEffortComparison =
        <TouchableOpacity style={{...styles.overlayItem, ...styles.overlaySplitItem, ...styles.overlayButton}}>
          <Text style={{...styles.segmentEffort}}>{segmentEffort.name}</Text>
        </TouchableOpacity>
      var versusSelect =
        <VersusDetailContainer style={{...styles.segmentEffort}} segmentEffort={segmentEffort} currentStreamTime={this.state.currentTimeActivity} />
    }

    // var leaderboardComparison = this.currentLeaderboardComparison(segmentEffort)

    return (
      <Animated.View
        style={{...styles.overlay, ...this.props.style}}
        pointerEvents={this.props.pointerEvents}>
        <View style={styles.overlayItemContainer}>
          <View style={styles.overlayStream}>
            {velocityOverlay}
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
