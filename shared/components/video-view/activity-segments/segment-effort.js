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
    return (
      <View style={styles.view}>
        <Text style={styles.effortName}>{_.get(this.props, 'segmentEffort.name')}</Text>
        <Text>Elapsed Time: {_.get(this.props, 'segmentEffort.elapsed_time')}s</Text>
        <Text>Distance: {_.get(this.props, 'segmentEffort.distance')}m</Text>
        <Text>Kom: {_.get(this.props, 'segmentEffort.kom_rank')}</Text>
        <Text>Personal: {_.get(this.props, 'segmentEffort.pr_rank')}</Text>
      </View>
    )
  }
}

const styles = {
  view: {
    flex: 1
  },

  effortName: {
    fontSize: 14,
    fontWeight: 'bold'
  }
}

SegmentEffort.propTypes = {
  segmentEffort: PropTypes.object
}
