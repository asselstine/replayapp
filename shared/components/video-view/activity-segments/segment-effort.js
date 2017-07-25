import React, {
  Component
} from 'react'
import {
  View,
  Text
} from 'react-native'
import PropTypes from 'prop-types'
import _ from 'lodash'

export class SegmentEffort extends Component {
  render () {
    var komRank = _.get(this.props, 'segmentEffort.kom_rank')
    var prRank = _.get(this.props, 'segmentEffort.pr_rank')

    if (komRank) {
      var komRankLabel =
        <Text>KOM {komRank}</Text>
    }

    if (prRank) {
      var prRankLabel =
        <Text>PR {prRank}</Text>
    }

    return (
      <View style={styles.view}>
        <View style={styles.leftPane}>
          <Text style={styles.effortName}>{_.get(this.props, 'segmentEffort.name')}</Text>
          {komRankLabel}
          {prRankLabel}
        </View>
        <View style={styles.rightPane}>
          <Text style={styles.headerData}>{_.get(this.props, 'segmentEffort.distance')}m</Text>
          <Text style={styles.headerData}>{_.get(this.props, 'segmentEffort.elapsed_time')}s</Text>
        </View>
      </View>
    )
  }
}

const styles = {
  view: {
    padding: 10,
    flexDirection: 'row'
  },

  leftPane: {
    flex: 1
  },

  rightPane: {
    width: 60
  },

  effortName: {
    fontSize: 22,
    fontWeight: '300'
  },

  headerData: {
    textAlign: 'right'
  }
}

SegmentEffort.propTypes = {
  segmentEffort: PropTypes.object
}
