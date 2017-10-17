import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import {
  TouchableOpacity,
  Animated,
  View
} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import _ from 'lodash'
import { Timeline } from './timeline'

export class PlayerOverlay extends Component {
  componentDidMount () {
    this.listener = this.props.eventEmitter.addListener('progressVideoTime', this.updateCurrentTime.bind(this))
  }

  componentWillUnmount () {
    this.listener.remove()
  }

  updateCurrentTime (currentTime) {
    this._timeline.updateCurrentTime(currentTime)
  }

  render () {
    var playToggle
    if (this.props.paused) {
      playToggle =
        <MaterialIcon
          name='play-arrow'
          style={{...styles.overlayIcon, ...styles.playButton}} />
    } else {
      playToggle =
        <MaterialIcon
          name='pause'
          style={{...styles.overlayIcon, ...styles.playButton}} />
    }

    var muteToggle
    if (this.props.muted) {
      muteToggle =
        <MaterialIcon
          name='volume-off'
          style={{...styles.overlayIcon, ...styles.overlaySmallIcon}} />
    } else {
      muteToggle =
        <MaterialIcon
          name='volume-up'
          style={{...styles.overlayIcon, ...styles.overlaySmallIcon}} />
    }

    var fullscreenToggle
    if (this.props.fullscreen) {
      fullscreenToggle =
        <MaterialIcon
          name='fullscreen-exit'
          style={{...styles.overlayIcon, ...styles.overlaySmallIcon}} />
    } else {
      fullscreenToggle =
        <MaterialIcon
          name='fullscreen'
          style={{...styles.overlayIcon, ...styles.overlaySmallIcon}} />
    }

    return (
      <Animated.View
        style={_.merge({}, styles.overlay, this.props.style)}
        pointerEvents={this.props.pointerEvents}>
        <View style={{...styles.overlaySmallBar, ...styles.overlayTop}}>
          <TouchableOpacity onPress={this.props.onClose}>
            <MaterialIcon
              name='keyboard-arrow-down'
              style={{...styles.overlayIcon, ...styles.overlaySmallIcon}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.props.onToggleFullscreen}>
            {fullscreenToggle}
          </TouchableOpacity>
          <TouchableOpacity onPress={this.props.onToggleMuted}>
            {muteToggle}
          </TouchableOpacity>
        </View>
        <View style={styles.overlayContent}>
          <TouchableOpacity onPress={this.props.onTogglePaused}>
            {playToggle}
          </TouchableOpacity>
        </View>
        <View style={{...styles.overlaySmallBar, ...styles.overlayBottom}}>
          <View style={{...styles.overlaySmallBar, ...styles.contentCenter}}>
            <Timeline
              ref={(ref) => { this._timeline = ref }}
              currentTime={this.props.currentTime}
              duration={this.props.duration}
              onVideoTimeChange={this.props.onVideoTimeChange} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },

  overlayIcon: {
    color: 'white'
  },

  overlaySmallBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  overlaySmallIcon: {
    fontSize: 30,
    padding: 10
  },

  overlayContent: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  overlayBottom: {
    alignItems: 'flex-end'
  },

  contentCenter: {
    alignItems: 'center'
  },

  overlayTop: {
  },

  playButton: {
    fontSize: 72
  }
}

PlayerOverlay.propTypes = {
  eventEmitter: PropTypes.object.isRequired,
  paused: PropTypes.bool.isRequired,
  muted: PropTypes.bool.isRequired,
  fullscreen: PropTypes.bool.isRequired,
  duration: PropTypes.number,
  currentTime: PropTypes.any,
  onTogglePaused: PropTypes.func.isRequired,
  onToggleMuted: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onVideoTimeChange: PropTypes.func.isRequired,
  style: PropTypes.any,
  pointerEvents: PropTypes.any
}
