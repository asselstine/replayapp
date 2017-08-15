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
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

export class ActivityOverlay extends Component {
  constructor (props) {
    super(props)
    this.state = {
      segments: [],
      streams: {}
    }
  }

  updateCurrentTime (currentTimeActivity) {
    console.log(currentTimeActivity)
  }

  render () {
    return (
      <Animated.View
        style={{...styles.overlay, ...this.props.style}}
        pointerEvents={this.props.pointerEvents}>
        <View style={{...styles.overlaySmallBar, ...styles.overlayBottom}}>
          <View style={{...styles.overlaySmallBar, ...styles.contentCenter}}>
            <Text style={styles.overlayText}>32 km/h</Text>
            <Text style={styles.overlayText}>400m</Text>
            <Text style={styles.overlayText}>1/2</Text>
            <Text style={styles.overlayText}>Patrick Thibodeau +0:04</Text>
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

  overlayText: {
    color: 'white',
    backgroundColor: 'transparent',
    fontSize: 14,
    padding: 10
  },

  overlaySmallBar: {
    flex: 1,
    flexDirection: 'row'
  },

  overlayContent: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  overlayBottom: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start'
  }
}

ActivityOverlay.propTypes = {
  currentTimeActivity: PropTypes.any.isRequired,
  activity: PropTypes.object.isRequired,
  style: PropTypes.any,
  pointerEvents: PropTypes.any
}
