import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import {
  View
} from 'react-native'
import _ from 'lodash'
import { SegmentEffort } from './segment-effort'
import { Strava } from '../../../strava'

export class ActivitySegments extends Component {
  componentDidMount () {
    Strava.retrieveActivity(this.props.activity.id).then((response) => {
      response.json().then((json) => {
        console.log(json)
        this.setState({
          detailedActivity: json
        })
      })
    })
  }

  render () {
    var segmentEfforts = _.get(this.state, 'detailedActivity.segment_efforts', [])
    return (
      <View style={styles.view}>
        {segmentEfforts.map((segmentEffort) => {
          return <SegmentEffort segmentEffort={segmentEffort} key={segmentEffort.id} />
        })}
      </View>
    )
  }
}

const styles = {
  view: {
    flex: 1
  }
}

ActivitySegments.propTypes = {
  activity: PropTypes.object
}
