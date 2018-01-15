import React, {
  Component
} from 'react'
import {
  View,
  Text,
} from 'react-native'
import PropTypes from 'prop-types'
import Ionicon from 'react-native-vector-icons/Ionicons'
import dpiNormalize from '../dpi-normalize'

export class Rank extends Component {
  render () {
    var trophyStyle = styles.trophy
    if (this.props.rank < 10) {
      var trophyIcon =
        <View>
          <Ionicon name='md-trophy' style={styles.trophy} />
          <View style={styles.trophyRankLabelContainer}>
            <Text style={styles.trophyRankLabel}>{this.props.rank}</Text>
          </View>
        </View>
    } else {
      trophyIcon =
        <View>
          <Text style={styles.rankLabel}>#{this.props.rank}</Text>
        </View>
    }

    return trophyIcon
  }
}

Rank.propTypes = {
  rank: PropTypes.number.isRequired
}

const styles = {

  rankLabel: {
    fontSize: dpiNormalize(16),
  },

  trophy: {
    fontSize: dpiNormalize(40),
    color: 'gold'
  },

  trophyRankLabelContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'absolute',
    top: dpiNormalize(-18),
    right: 0,
    left: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: dpiNormalize(32),
  },

  rankNumberBackground: {
    backgroundColor: 'white',
    borderColor: 'white',
    borderRadius: 50,
  },

  trophyRankLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    textAlign: 'center',
    color: 'white',
    fontSize: dpiNormalize(12),
    fontWeight: '900',
  },
}
