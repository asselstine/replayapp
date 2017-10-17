import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import {
  ScrollView
} from 'react-native'
import _ from 'lodash'
import { SegmentEffortItem } from './segment-effort-item'
import { Strava } from '../../../../strava'
import { ActivityService } from '../../../../services/activity-service'
import { Video } from '../../../../video'
import { SegmentEffort } from '../../../../segment-effort'
import moment from 'moment'

export class ActivitySegments extends Component {
  componentDidMount () {
    ActivityService.retrieveActivity(this.props.activity.id)
  }

  segmentEfforts () {
    var videoStartAt = Video.startAt(this.props.video)
    var videoEndAt = Video.endAt(this.props.video)
    return this.props.segmentEfforts.reduce((matching, segmentEffort) => {
      var dates = SegmentEffort.dates(segmentEffort)
      if (dates.start.isSameOrBefore(videoEndAt) &&
          dates.end.isSameOrAfter(videoStartAt)) {
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
            <SegmentEffortItem
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
