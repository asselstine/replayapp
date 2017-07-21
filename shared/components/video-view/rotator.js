import React, {
  Component
} from 'react'
import Orientation from 'react-native-orientation'
import _ from 'lodash'
import {
  View,
  Dimensions,
  Animated,
  StatusBar
} from 'react-native'

export class Rotator extends Component {
  constructor (props) {
    super(props)
    this._onOrientationChange = this._onOrientationChange.bind(this)
    this.state = {
      landscape: false,
      progress: new Animated.Value(0)
    }
    Orientation.getOrientation((err, orientation) => {
      if (err) {
        console.error(err)
      } else {
        this._onOrientationChange(orientation)
      }
    })
  }

  componentDidMount () {
    Orientation.addOrientationListener(this._onOrientationChange)
  }

  componentWillUnmount () {
    Orientation.removeOrientationListener(this._onOrientationChange)
  }

  _onOrientationChange (orientation) {
    console.log(orientation)
    var landscape = orientation === 'LANDSCAPE'
    this.setState({ landscape: landscape }, () => {
      if (landscape) {
        var toValue = 1
      } else {
        toValue = 0
      }
      Animated.timing(
        this.state.progress,
        {
          toValue: toValue,
          duration: 200
        }
      ).start()
    })
  }

  onLayout (event) {
    this.setState({
      width: _.get(event, 'nativeEvent.layout.width'),
      height: _.get(event, 'nativeEvent.layout.height')
    })
  }

  render () {
    const window = Dimensions.get('window')
    if (this.state.landscape) {
      var style = {
        position: 'absolute',
        backgroundColor: 'white',
        zIndex: 9999,
        overflow: 'hidden',
        width: this.state.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [this.state.width, window.height]
        }),
        height: this.state.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [this.state.height, window.width]
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
      var placeholder =
        <View style={{ height: this.state.height, width: this.state.width }}>
          <StatusBar hidden />
        </View>
    } else {
      style = {
      }
    }
    return (
      <View
        onLayout={this.onLayout.bind(this)}
        style={{zIndex: 9999}}>
        {placeholder}
        <Animated.View style={style}>
          {this.props.children}
        </Animated.View>
      </View>
    )
  }
}
