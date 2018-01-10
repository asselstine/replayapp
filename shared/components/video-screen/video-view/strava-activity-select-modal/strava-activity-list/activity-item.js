import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableHighlight
} from 'react-native'
import moment from 'moment'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import formatDuration from '../../../../../format-duration'
import dpiNormalize from '../../../../../dpi-normalize'

export class ActivityItem extends Component {
  constructor (props) {
    super(props)
    this._onPress = this._onPress.bind(this)
  }

  _onPress () {
    if (this.props.onPress) {
      this.props.onPress(this.props.activity)
    }
  }

  render () {
    var startAt = moment(this.props.activity.start_date)

    /*
      Interesting data:

      - type (run / bike)
      - name
      - achievement_count
      - average_watts
      - start_date
      - moving_time
      - distance
      - total_elevation_gain

    */

    return (
      <TouchableHighlight
        activeOpacity={0.2}
        underlayColor='#ff0000'
        onPress={this._onPress}>
        <View style={styles.activityItem}>
          <Text style={styles.activityName}>{this.props.activity.name}</Text>
          <View style={styles.activityDetails}>
            <View style={styles.activityDetailItem}>
              <MaterialCommunityIcon style={styles.activityDetailIcon} name='calendar' />
              <Text style={styles.activityDetailLabel}>{startAt.fromNow()}</Text>
            </View>
            <View style={styles.activityDetailItem}>
              <MaterialCommunityIcon style={styles.activityDetailIcon} name='clock' />
              <Text style={styles.activityDetailLabel}>{formatDuration(moment.duration(this.props.activity.moving_time * 1000))}</Text>
            </View>
            <View style={styles.activityDetailItem}>
              <MaterialCommunityIcon style={styles.activityDetailIcon} name='altimeter' />
              <Text style={styles.activityDetailLabel}>{this.props.activity.total_elevation_gain}m</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

const styles = {
  activityItem: {
    paddingBottom: 12,
    flexDirection: 'row',
  },

  activityName: {
    fontSize: dpiNormalize(24),
    fontWeight: '300',
    flex: 1,
  },

  activityDetails: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flex: 0,
    width: dpiNormalize(100)
  },

  activityDetailIcon: {
    paddingRight: 4,
    fontSize: dpiNormalize(14),
  },

  activityDetailLabel: {
    fontSize: dpiNormalize(14)
  },

  activityDetailItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
}
