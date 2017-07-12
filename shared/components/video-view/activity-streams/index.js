import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  View
} from 'react-native'
import _ from 'lodash'
import { StreamTimeGraph } from './stream-time-graph'

export class ActivityStreams extends PureComponent {
  render () {
    if (_.get(this.props, 'streams.velocity_smooth')) {
      var velocityStreamTimeGraph =
        <StreamTimeGraph
          timeStream={this.props.streams.time.data}
          dataStream={this.props.streams.velocity_smooth.data} />
    }

    if (_.get(this.props, 'streams.altitude')) {
      var altitudeStreamTimeGraph =
        <StreamTimeGraph
          timeStream={this.props.streams.time.data}
          dataStream={this.props.streams.altitude.data} />
    }

    return (
      <View>
        {velocityStreamTimeGraph}
        {altitudeStreamTimeGraph}
      </View>
    )
  }
}

ActivityStreams.propTypes = {
  streams: PropTypes.object,
  activity: PropTypes.object.isRequired
}
