import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import {
  ScrollView
} from 'react-native'
import _ from 'lodash'
import { SegmentEffort } from './segment-effort'
import { Strava } from '../../../../strava'
import { ActivityService } from '../../../../services/activity-service'

export class ActivitySegments extends Component {
  componentDidMount () {
    ActivityService.retrieveActivity(this.props.activity.id)
  }

  render () {
    return (
      <ScrollView style={styles.view}>
        {this.props.segmentEfforts.map((segmentEffort) => {
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
  onStreamTimeChange: PropTypes.func,
  segmentEfforts: PropTypes.array
}
