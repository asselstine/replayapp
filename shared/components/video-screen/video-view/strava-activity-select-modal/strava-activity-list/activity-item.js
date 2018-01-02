import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableHighlight
} from 'react-native'
import moment from 'moment'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import formatDuration from '../../../../../format-duration'

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
              <Text>{startAt.fromNow()}</Text>
            </View>
            <View style={styles.activityDetailItem}>
              <MaterialCommunityIcon style={styles.activityDetailIcon} name='clock' />
              <Text>{formatDuration(moment.duration(this.props.activity.moving_time * 1000))}</Text>
            </View>
            <View style={styles.activityDetailItem}>
              <MaterialCommunityIcon style={styles.activityDetailIcon} name='altimeter' />
              <Text>{this.props.activity.total_elevation_gain}m</Text>
            </View>
            <View style={styles.activityDetailItem}>
              <MaterialCommunityIcon style={styles.activityDetailIcon} name='flash' />
              <Text>{this.props.activity.average_watts} watts</Text>
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
  },

  activityName: {
    fontSize: 24
  },

  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  activityDetailIcon: {
    paddingRight: 4
  },

  activityDetailItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
}
