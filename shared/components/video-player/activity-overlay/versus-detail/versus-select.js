import React, {
  Component
} from 'react'
import {
  TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import { SegmentEffortSelectModal } from '../../../segment-effort-select-modal'

export class VersusSelect extends Component {
  constructor (props) {
    super(props)
    this.state = {
      segmentEffortModalOpen: false
    }
  }

  onCloseSegmentEffortModal () {
    this.setState({
      segmentEffortModalOpen: false
    })
  }

  onSelectSegmentEffort (leaderboardEntry) {
    this.props.onSelectLeaderboardEntry(leaderboardEntry)
    this.onCloseSegmentEffortModal()
  }

  openSegmentEffortModal () {
    this.setState({
      segmentEffortModalOpen: true
    })
  }

  render () {
    return (
      <TouchableOpacity onPress={() => { this.openSegmentEffortModal() }} style={this.props.style}>
        {this.props.children}
        <SegmentEffortSelectModal
          isOpen={this.state.segmentEffortModalOpen}
          leaderboard={this.props.leaderboardEntries}
          onSelect={(leaderboardEntry) => { this.onSelectSegmentEffort(leaderboardEntry) }}
          onClose={() => { this.onCloseSegmentEffortModal() }} />
      </TouchableOpacity>
    )
  }
}

VersusSelect.propTypes = {
  onSelectLeaderboardEntry: PropTypes.func.isRequired,
  leaderboardEntries: PropTypes.array.isRequired
}
