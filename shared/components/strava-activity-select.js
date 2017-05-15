import React, {
  View,
  Text,
  TouchableOpacity,
  Component
} from 'react'
import { Strava } from '../strava'

export class StravaActivitySelect extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activities: []
    }
  }

  // componentDidMount () {
  //   Strava
  //     .listActivities()
  //     .then((response) => {
  //       this.setState({ activities: response.json() })
  //     })
  // }

  render () {
    // {this.state.activities.map((activity) => {
    //   <Text>{activity.name}</Text>
    // })}

    var hello = 'Hello'

    return (
      <View style={styles.stravaActivitySelect}>
      </View>
    )
  }
}

const styles = {
  stravaActivitySelect: {
    flex: 1,
    flexDirection: 'column'
  }
}
