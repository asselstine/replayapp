import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableHighlight
} from 'react-native'
import moment from 'moment'

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
    return (
      <TouchableHighlight
        activeOpacity={0.2}
        underlayColor='#ff0000'
        onPress={this._onPress}>
        <View style={styles.activityItem}>
          <Text>{startAt.format('ddd MMM D, YYYY')}</Text>
          <Text style={styles.activityName}>{this.props.activity.name}</Text>
        </View>
      </TouchableHighlight>
    )
  }
}

const styles = {
  activityItem: {
    padding: 12
  },

  activityName: {
    fontSize: 24
  }
}
