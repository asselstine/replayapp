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

export class VersusDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      segmentEffortModalOpen: false,
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

  onCloseSegmentEffortModal () {
    this.setState({
      segmentEffortModalOpen: false
    })
  }

  onSelectSegmentEffort (leaderboardEntry) {
    this.setState({
      versusLeaderboardEntry: leaderboardEntry
    })
    this.onCloseSegmentEffortModal()
  }

  openSegmentEffortModal () {
    this.setState({
      segmentEffortModalOpen: true
    })
  }

  render () {
    if (this.state.versusLeaderboardEntry) {
      var modal =
        <SegmentEffortSelectModal
          isOpen={this.state.segmentEffortModalOpen}
          leaderboard={this.props.leaderboardEntries}
          onSelect={(leaderboardEntry) => { this.onSelectSegmentEffort(leaderboardEntry) }}
          onClose={() => { this.onCloseSegmentEffortModal() }} />

      var result =
        <View style={styles.container}>
          <VersusTimeContainer
            segmentEffort={this.props.segmentEffort}
            versusLeaderboardEntry={this.state.versusLeaderboardEntry}
            currentStreamTime={this.props.currentStreamTime} />
          {modal}
          <TouchableOpacity onPress={() => { this.openSegmentEffortModal() }}>
            <Text style={this.props.style}>{this.state.versusLeaderboardEntry.athlete_name}</Text>
            <Icon name='md-arrow-dropdown' style={styles.opponentIcon}/>
          </TouchableOpacity>
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
  container: {
    flexDirection: 'row'
  },

  opponentIcon: {
    fontSize: 18,
  }
}
