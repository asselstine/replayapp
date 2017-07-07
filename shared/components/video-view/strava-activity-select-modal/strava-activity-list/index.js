import React, { Component } from 'react'
import {
  FlatList
} from 'react-native'
import { Strava } from '../../../../strava'
import { ActivityItem } from './activity-item'
import PropTypes from 'prop-types'

export class StravaActivityList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activities: [],
      page: 0,
      hasMore: true
    }
    this._onEndReached = this._onEndReached.bind(this)
    this._renderItem = this._renderItem.bind(this)
  }

  componentDidMount () {
    // this.getNextPage()
  }

  getNextPage () {
    var nextPage = this.state.page + 1
    Strava
      .listActivities({ page: nextPage })
      .then((response) => {
        response.json().then((activities) => {
          if (activities.length > 0) {
            this.setState({ activities: this.state.activities.concat(activities), page: nextPage })
          } else {
            this.setState({ hasMore: false })
          }
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  _renderItem ({item, index}) {
    return <ActivityItem activity={item} onPress={this.props.onPress} key={item.id} />
  }

  _onEndReached () {
    if (this.state.hasMore) {
      this.getNextPage()
    }
  }

  render () {
    return (
      <FlatList
        data={this.state.activities}
        extraData={this.state}
        keyExtractor={(item, index) => item.id}
        renderItem={this._renderItem}
        onEndReached={this._onEndReached} />
    )
  }
}

StravaActivityList.propTypes = {
  onPress: PropTypes.func.isRequired
}
