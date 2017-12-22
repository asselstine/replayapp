import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Text,
  Animated,
  PanResponder
} from 'react-native'
import _ from 'lodash'
import Color from 'color'

export class Button extends Component {
  componentWillMount () {
    this._pressAnimation = new Animated.Value(0)
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderGrant: (e) => {
        Animated.timing(
          this._pressAnimation,
          {
            toValue: 1,
            duration: 100,
          }
        ).start()
      },
      onPanResponderRelease: (e) => {
        this.props.onPress(e)
        Animated.timing(
          this._pressAnimation,
          {
            toValue: 0,
            duration: 200,
          }
        ).start()
      },
    })
  }
  render () {
    var bgColor = this.props.backgroundColor
    var darkerColor = Color(bgColor).darken(0.5)

    const viewStyle = _.merge(
      {},
      styles.button_touchable,
      {
        backgroundColor: this._pressAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [bgColor, darkerColor]
        })
      },
    )

    const labelStyle = _.merge(
      {},
      styles.label,
      _.pick(this.props, 'color')
    )
    return (
      <View style={styles.container}>
        <View style={styles.button}>
          <Animated.View
            style={viewStyle}
            {...this._panResponder.panHandlers}>
            <Text style={labelStyle}>{this.props.title}</Text>
          </Animated.View>
        </View>
      </View>
    )
  }
}

Button.propTypes = {
  title: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string,
  color: PropTypes.string
}

Button.defaultProps = {
  backgroundColor: 'red'
}

const radius = 50

const styles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  button_touchable: {
    padding: 15,
    backgroundColor: 'red',
    borderRadius: radius,
    flex: 0,
  },

  label: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600'
  }
}
