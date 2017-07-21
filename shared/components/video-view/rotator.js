import React, {
  Component
} from 'react'
import Orientation from 'react-native-orientation'
import _ from 'lodash'
import {
  View,
  Dimensions,
  StatusBar
} from 'react-native'

export class Rotator extends Component {
  constructor (props) {
    super(props)
    this._onOrientationChange = this._onOrientationChange.bind(this)
    this.state = {
      landscape: false
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
    this.setState({ landscape: orientation === 'LANDSCAPE' })
  }

  onLayout (event) {
    this.setState({
      width: _.get(event, 'nativeEvent.layout.width'),
      height: _.get(event, 'nativeEvent.layout.height')
    })
  }

  render () {
    const { height, width } =  Dimensions.get('window')
    if (this.state.landscape) {
      var style = {
        position: 'absolute',
        zIndex: 9999,
        overflow: 'hidden',
        width: height,
        height: width,
        transform: [
          { translateX: width },
          { translateX: height * -0.5 },
          { translateY: width * -0.5 },
          {
            rotate: '90deg'
          },
          { translateX: height * 0.5 },
          { translateY: width * 0.5 }
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
        <View style={style}>
          {this.props.children}
        </View>
      </View>
    )
  }
}
