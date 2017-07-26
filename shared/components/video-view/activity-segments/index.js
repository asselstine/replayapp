import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import {
  View,
  ScrollView
} from 'react-native'
import _ from 'lodash'
import { SegmentEffort } from './segment-effort'
import { Strava } from '../../../strava'

export class ActivitySegments extends Component {
  componentDidMount () {
    Strava.retrieveActivity(this.props.activity.id).then((response) => {
      response.json().then((json) => {
        this.setState({
          detailedActivity: json
        })
      })
    })
  }

  render () {
    var segmentEfforts = _.get(this.state, 'detailedActivity.segment_efforts', [])
    return (
      <ScrollView style={styles.view}>
        {segmentEfforts.map((segmentEffort) => {
          return (
            <SegmentEffort
              eventEmitter={this.props.eventEmitter}
              segmentEffort={segmentEffort}
              onStreamTimeChange={this.props.onStreamTimeChange}
              key={segmentEffort.id} />
          )
        })}
      </ScrollView>
    )
  }
}

const styles = {
  view: {
    flex: 1
  }
}

ActivitySegments.propTypes = {
  activity: PropTypes.object,
  eventEmitter: PropTypes.object.isRequired,
  onStreamTimeChange: PropTypes.func
}
