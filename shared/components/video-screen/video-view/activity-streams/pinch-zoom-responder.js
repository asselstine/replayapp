import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

export class PinchZoomResponder {
  constructor (responders) {
    this.responders = responders
    this.handlers = {
      onStartShouldSetResponder: this.onStartShouldSetResponder.bind(this),
      onMoveShouldSetResponder: this.onMoveShouldSetResponder.bind(this),
      onStartShouldSetResponderCapture: this.onStartShouldSetResponderCapture.bind(this),
      onMoveShouldSetResponderCapture: this.onMoveShouldSetResponderCapture.bind(this),
      onResponderGrant: this.onResponderGrant.bind(this),
      onResponderMove: this.onResponderMove.bind(this),
      onResponderReject: this.onResponderReject.bind(this),
      onResponderRelease: this.onResponderRelease.bind(this),
      onResponderTerminate: this.onResponderTerminate.bind(this),
      onResponderTerminationRequest: this.onResponderTerminationRequest.bind(this)
    }
    this.touches = {}
  }

  onStartShouldSetResponder () { /* console.log('start should set'); */ return true }
  onMoveShouldSetResponder () { /* console.log('move should set'); */ return true }
  onStartShouldSetResponderCapture () { /* console.log('start set capture'); */ return true }
  onMoveShouldSetResponderCapture () { /* console.log('move set capture'); */ return true }
  onResponderReject (e) { /* console.log('reject') */ }
  onResponderTerminationRequest () { /* console.log('terminate request'); */ return false }

  storeOriginalTouches (touches) {
    touches.forEach((touch) => {
      if (!this.touches[touch.identifier]) {
        this.touches[touch.identifier] = touch
      }
      if (!touch.touches) { return }
      touch.touches.forEach((secondaryTouch) => {
        if (secondaryTouch.identifier !== touch.identifier &&
            !this.touches[secondaryTouch.identifier]) {
          this.touches[secondaryTouch.identifier] = secondaryTouch
        }
      })
    })
  }

  clearOldTouches (touches) {
    for (var key in this.touches) {
      var found = false
      for (var i in touches) {
        if (touches[i].identifier == key) {
          found = true
        }
      }
      if (!found) {
        delete this.touches[key]
      }
    }
  }

  onResponderGrant (e) {
    this.updateTouchState(e)
  }

  updateTouchState (e) {
    var oldTouchCount = Object.keys(this.touches).length
    this.clearOldTouches(e.nativeEvent.touches)
    this.storeOriginalTouches(e.nativeEvent.touches)
    var newTouchCount = Object.keys(this.touches).length
    if (oldTouchCount < 2 && newTouchCount >= 2) {
      this.onPinchZoomStart(e)
      this.scaleCenterX = this.centerX(e.nativeEvent)
    } else if (oldTouchCount >= 2 && newTouchCount < 2) {
      this.onPinchZoomEnd(e)
    }
    if (newTouchCount < 2) {
      this.touches = {}
    }
    this.scaleCenterX = this.centerX(e.nativeEvent)
  }

  onResponderMove (e) {
    this.updateTouchState(e)
    if (e.nativeEvent.touches.length === 2) {
      var newTransform = MatrixMath.createIdentityMatrix()
      this.translateAndScale(newTransform, e)
    }
    if (this.responders.onResponderMove) {
      return this.responders.onResponderMove(e, {
        transform: newTransform,
        centerX: this.scaleCenterX
      })
    }
  }

  onPinchZoomStart (e) {
    if (this.responders.onPinchZoomStart) {
      return this.responders.onPinchZoomStart(e)
    }
  }

  onPinchZoomEnd (e) {
    if (this.responders.onPinchZoomEnd) {
      return this.responders.onPinchZoomEnd(e)
    }
  }

  onResponderRelease (e) {
    this.updateTouchState(e)
  }

  onResponderTerminate (e) {
  }

  translateAndScale (command, e) {
    var translate

    var scale = this.scaleX(e.nativeEvent)
    var dx = this.deltaX(e.nativeEvent)

    translate = MatrixMath.createTranslate2d(dx, 0)
    MatrixMath.multiplyInto(command, translate, command)

    translate = MatrixMath.createTranslate2d(-this.scaleCenterX, 0)
    MatrixMath.multiplyInto(command, translate, command)

    translate = MatrixMath.createIdentityMatrix()
    MatrixMath.reuseScaleXCommand(translate, scale)
    MatrixMath.multiplyInto(command, translate, command)

    translate = MatrixMath.createIdentityMatrix()
    MatrixMath.reuseTranslate2dCommand(translate, this.scaleCenterX, 0)
    MatrixMath.multiplyInto(command, translate, command)

    return command
  }

  deltaX (nativeEvent) {
    return nativeEvent.touches.reduce((totalDeltaX, touch) => {
      return totalDeltaX + (touch.locationX - this.touches[touch.identifier].locationX)
    }, 0) / nativeEvent.touches.length
  }

  scaleX (nativeEvent) {
    return this.scale(nativeEvent, 'locationX')
  }

  scale (nativeEvent, field) {
    var spread = this.spread(nativeEvent, field)
    var startSpread = this.startSpread(nativeEvent, field)
    if (startSpread === 0) {
      var _scale = 1
    } else {
      _scale = spread / (this.startSpread(nativeEvent, field) * 1.0)
    }
    return _scale
  }

  startSpreadX (nativeEvent) {
    return this.startSpread(nativeEvent, 'locationX')
  }

  spreadX (nativeEvent) {
    return this.spread(nativeEvent, 'locationX')
  }

  startSpread (nativeEvent, field) {
    var locations = nativeEvent.touches.map((touch) => this.touches[touch.identifier][field])
    return Math.max(...locations) - Math.min(...locations)
  }

  spread (nativeEvent, field) {
    var locations = nativeEvent.touches.map((touch) => touch[field])
    return Math.max(...locations) - Math.min(...locations)
  }

  centerX (nativeEvent, identifierSet) {
    return this.center(nativeEvent, identifierSet, 'locationX')
  }

  center (nativeEvent, identifierSet, field) {
    var totalPage = nativeEvent.touches.reduce((total, touch) => {
      return total + touch[field]
    }, 0)
    return totalPage / nativeEvent.touches.length
  }
}
