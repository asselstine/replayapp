import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Dimensions,
  Animated
} from 'react-native'

export class Rotator extends Component {
  constructor (props) {
    super(props)
    if (props.landscape) {
      var toValue = 1
    } else {
      toValue = 0
    }
    this.state = {
      progress: new Animated.Value(toValue)
    }
    this.onComplete = this.onComplete.bind(this)
  }

  componentWillReceiveProps (props) {
    if (props.landscape) {
      var toValue = 1
    } else {
      toValue = 0
    }
    Animated.timing(
      this.state.progress,
      {
        toValue: toValue,
        duration: 400
      }
    ).start(this.onComplete)
  }

  onComplete () {
    if (this.props.onComplete) {
      this.props.onComplete()
    }
  }

  render () {
    const window = Dimensions.get('window')
    var style = {
      position: 'absolute',
      backgroundColor: 'white',
      zIndex: 9999,
      overflow: 'hidden',
      width: this.state.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [this.props.width, window.height]
      }),
      height: this.state.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [this.props.height, window.width]
      }),
      transform: [
        {
          translateX: this.state.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, window.width]
          })
        },
        {
          translateX: this.state.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, window.height * -0.5]
          })
        },
        {
          translateY: this.state.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, window.width * -0.5]
          })
        },
        {
          rotate: this.state.progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '90deg']
          })
        },
        {
          translateX: this.state.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, window.height * 0.5]
          })
        },
        {
          translateY: this.state.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, window.width * 0.5]
          })
        }
      ]
    }

    return (
      <View
        style={{zIndex: 9999}}>
        <View style={{width: this.props.width, height: this.props.height}} />
        <Animated.View style={style}>
          {this.props.children}
        </Animated.View>
      </View>
    )
  }
}

Rotator.propTypes = {
  landscape: PropTypes.bool.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  onComplete: PropTypes.func
}
