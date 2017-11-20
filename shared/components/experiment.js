import React, {
  Component,
  PureComponent
} from 'react'
import {
  View,
  Text,
} from 'react-native'
import PinchZoomResponder from 'react-native-pinch-zoom-responder'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'
import _ from 'lodash'

export class Experiment extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      width: 1,
      height: 1,
    }
    this._onLayout = this._onLayout.bind(this)
    this.setTransform = _.throttle(this.setTransform.bind(this), 20)
  }

  _onLayout (event) {
    var width = _.get(event, 'nativeEvent.layout.width')
    var height = _.get(event, 'nativeEvent.layout.height')
    this.setState({
      width: width || 1,
      height: height || 1
    })
  }

  componentWillMount () {
    this.pinchZoomResponder = new PinchZoomResponder({
      onPinchZoomStart: (e) => {
      },

      onPinchZoomEnd: (e) => {
      },

      onResponderMove: (e, gestureState) => {
        if (gestureState) {
          this.setTransform(gestureState.transform)
        }
      },
    }, { transformY: false })
    this.handlers = {
      onStartShouldSetResponder: () => { return true },
      onMoveShouldSetResponder: () => { return true },
      onStartShouldSetResponderCapture: () => { return true },
      onMoveShouldSetResponderCapture: () => { return true },
      onResponderTerminationRequest: () => { return false },
      onResponderGrant: (e) => {
        this.pinchZoomResponder.handlers.onResponderGrant(e)
      },
      onResponderMove: (e) => {
        this.pinchZoomResponder.handlers.onResponderMove(e)
      },
      onResponderRelease: (e) => {
        this.pinchZoomResponder.handlers.onResponderRelease(e)
      },
    }
  }

  addOriginTransformTo (matrix) {
    var translate = MatrixMath.createIdentityMatrix()
    var copy = matrix.slice()
    MatrixMath.reuseTranslate2dCommand(translate, (this.state.width / 2.0), 0)
    MatrixMath.multiplyInto(copy, matrix, translate)
    MatrixMath.reuseTranslate2dCommand(translate, -(this.state.width / 2.0), 0)
    MatrixMath.multiplyInto(copy, translate, copy)
    return copy
  }

  setTransform (matrix) {
    this.transformView.setNativeProps({ style: { transform: [{perspective: 1000}, { matrix: this.addOriginTransformTo(matrix) }] } })
  }

  render () {
    return (
      <View
        {...this.handlers}
        onLayout={this._onLayout}>
        <View
          ref={(ref) => { this.transformView = ref }}>
          <Text>
            Hello this is some text asd asdf asdf as dfasdf asgd
            Hello this is some text asd asdf asdf as dfasdf asgd
            Hello this is some text asd asdf asdf as dfasdf asgd
          </Text>
        </View>
        <View
          style={{position: 'absolute', left: 0, top: 0, bottom: 0, right: 0}}
          height='100%'
          width='100%' />
      </View>
    )
  }
}
