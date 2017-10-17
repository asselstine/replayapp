import React, {
  Component
} from 'react'
import {
  View,
  TouchableOpacity,
  Text
} from 'react-native'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons'
import { SegmentService } from '../../../../services/segment-service'
import { VersusTimeContainer } from './versus-time-container'
import { SegmentEffortSelectModal } from '../../../segment-effort-select-modal'
import { VersusSelect } from './versus-select'

export class VersusDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      versusLeaderboardEntry: _.first(props.leaderboardEntries)
    }
  }

  componentDidMount () {
    SegmentService.retrieveLeaderboard(this.props.segmentEffort.segment.id)
  }

  componentWillReceiveProps (props) {
    if (this.props.leaderboardEntries.length != props.leaderboardEntries.length) {
      this.setState({
        versusLeaderboardEntry: _.first(props.leaderboardEntries)
      })
    }
  }

  onSelectSegmentEffort (leaderboardEntry) {
    this.setState({
      versusLeaderboardEntry: leaderboardEntry
    })
  }

  render () {
    if (this.state.versusLeaderboardEntry) {
      var result =
        <View style={styles.versusContainer}>
          <VersusTimeContainer
            segmentEffort={this.props.segmentEffort}
            versusLeaderboardEntry={this.state.versusLeaderboardEntry}
            currentStreamTime={this.props.currentStreamTime} />
          <VersusSelect onSelectLeaderboardEntry={(entry) => { this.onSelectSegmentEffort(entry) }} leaderboardEntries={this.props.leaderboardEntries}>
            <Text style={this.props.style}>{this.state.versusLeaderboardEntry.athlete_name}</Text>
            <Icon name='md-arrow-dropdown' style={styles.opponentIcon}/>
          </VersusSelect>
        </View>
    } else {
      result = <View><Text>{this.props.segmentEffort.name} {this.props.leaderboardEntries.length}</Text></View>
    }
    return (
      result
    )
  }
}

VersusDetail.propTypes = {
  segmentEffort: PropTypes.object.isRequired,
  leaderboardEntries: PropTypes.array.isRequired,
  currentStreamTime: PropTypes.number.isRequired
}

const styles = {
  versusContainer: {
    flexDirection: 'row'
  },

  opponentIcon: {
    fontSize: 18,
  }
}
