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

export class ActivityOverlay extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentTimeActivity: props.currentTimeActivity,
      showVelocity: false,
      streamOverlayProgress: new Animated.Value(0)
    }
    this._toggleVelocity = this._toggleVelocity.bind(this)
  }

  componentDidMount () {
    ActivityService.retrieveStreams(this.props.activity.id)
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

  _toggleVelocity () {
    if (this.state.showVelocity) {
      Animated.timing(
        this.state.streamOverlayProgress,
        {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }
      ).start(() => {
        this.setState({ showVelocity: false })
      })
    } else {
      this.setState({ showVelocity: true }, () => {
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

  render () {
    var velocity = round(Activity.velocityAt(this.props.streams, this.state.currentTimeActivity), 1)
    var altitude = `${Activity.altitudeAt(this.props.streams, this.state.currentTimeActivity)} m`

    var velocityOverlayStyle = {
      opacity: this.state.streamOverlayProgress
    }

    if (this.state.showVelocity) {
      var velocityOverlay =
        <Animated.View style={velocityOverlayStyle}>
          <StreamOverlay
            ref={(ref) => { this._velocityOverlay = ref }}
            activityStartTime={this.props.activityStartTime}
            activityEndTime={this.props.activityEndTime}
            currentTimeActivity={this.props.currentTimeActivity}
            timeStream={this.props.streams.time.data}
            dataStream={this.props.streams.velocity_smooth.data}
            onActivityTimeChange={this.props.onActivityTimeChange} />
        </Animated.View>
    }

    var segmentEffortComparison

    /*
    segmentEffortComparison =
      <TouchableOpacity style={{...styles.overlayItem, ...styles.overlaySplitItem, ...styles.overlayButton}}>
        <Text style={styles.overlayText}>1/2 </Text>
        <Text style={styles.overlayText}>Patrick Thibodeau +0:04</Text>
      </TouchableOpacity>
    */

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
                <TouchableOpacity style={{...styles.dataItem, ...styles.overlayButton}} onPress={this._toggleVelocity}>
                  <MaterialCommunityIcon style={{...styles.overlayText, ...styles.icon}} name='speedometer' />
                  <Text style={{...styles.overlayText, ...styles.textWidth4}}>{velocity}</Text>
                  <Text style={styles.overlayText}>km/h</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{...styles.dataItem, ...styles.overlayButton}}>
                  <MaterialCommunityIcon style={{...styles.overlayText, ...styles.icon}} name='altimeter' />
                  <Text style={styles.overlayText}>{altitude}</Text>
                </TouchableOpacity>
              </View>
              {segmentEffortComparison}
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
  streams: PropTypes.object
}

ActivityOverlay.defaultProps = {
  streams: {}
}
