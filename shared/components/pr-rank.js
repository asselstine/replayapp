import React, {
  Component
} from 'react'
import {
  View,
  Text,
} from 'react-native'
import PropTypes from 'prop-types'
import Color from 'color'
import Entypo from 'react-native-vector-icons/Entypo'

export class PrRank extends Component {
  render () {
    switch (this.props.prRank) {
      case 3:
        var color = '#b87333'
        var bgColor = '#f2cca9'
        break;
      case 2:
        color = '#c0c0c0'
        bgColor = '#e3e3e3'
        break;
      case 1:
        bgColor = '#ffd700'
        color = Color(bgColor).lighten(0.8)
        break;
    }

    var outerCircleStyle = {
      borderRadius: 50,
      backgroundColor: color,
      width: this.props.size,
      height: this.props.size,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }

    var innerCicleFraction = 0.85
    var innerCircleSize = 2 * Math.round((this.props.size * innerCicleFraction) / 2);

    var innerCircleStyle = {
      backgroundColor: bgColor,
      width: innerCircleSize,
      height: innerCircleSize,
      flex: 0,
      borderRadius: 50,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }

    var medalStyle = {
      color: color,
      borderRadius: 50,
      fontSize: 0.55 * this.props.size,
    }

    if (color) {
      var rankIcon =
        <View style={outerCircleStyle}>
          <View style={innerCircleStyle}>
            <Entypo name='medal' style={medalStyle} />
          </View>
        </View>
    } else {
      rankIcon = <Text style={styles.rankLabel}>#{this.props.prRank}</Text>
    }

    return rankIcon
  }
}

PrRank.propTypes = {
  prRank: PropTypes.number.isRequired,
  size: PropTypes.number
}

PrRank.defaultProps = {
  size: 30
}
