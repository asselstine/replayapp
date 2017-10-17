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
import { Video } from '../../../../video'
import moment from 'moment'

export class ActivitySegments extends Component {
  componentDidMount () {
    ActivityService.retrieveActivity(this.props.activity.id)
  }

  segmentEfforts () {
    var videoStartAt = Video.startAt(this.props.video)
    var videoEndAt = Video.endAt(this.props.video)
    return this.props.segmentEfforts.reduce((matching, segmentEffort) => {
      if (moment(segmentEffort.start_date).isBetween(videoStartAt, videoEndAt)) {
        matching.push(segmentEffort)
      }
      return matching
    }, [])
  }

  render () {
    return (
      <ScrollView style={styles.view}>
        {this.segmentEfforts().map((segmentEffort) => {
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
  video: PropTypes.object,
  activity: PropTypes.object,
  eventEmitter: PropTypes.object.isRequired,
  onStreamTimeChange: PropTypes.func,
  segmentEfforts: PropTypes.array
}
