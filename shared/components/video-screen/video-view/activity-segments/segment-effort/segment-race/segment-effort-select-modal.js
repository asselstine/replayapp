import React, {
  Component
} from 'react'
import {
  Modal,
  FlatList,
  TouchableOpacity,
  Button,
  Text
} from 'react-native'
import { Strava } from '../../../../../../strava'
import PropTypes from 'prop-types'

export class SegmentEffortSelectModal extends Component {
  constructor (props) {
    super(props)
    this._renderItem = this._renderItem.bind(this)
  }

  _renderItem ({ item, index, separators }) {
    return (
      <TouchableOpacity
        onPress={() => { this.props.onSelect(item) }}
        style={styles.leaderboardEntry}>
        <Text style={styles.leaderboardEntryRank}>{item.rank}</Text>
        <Text style={styles.leaderboardEntryName}>{item.athlete_name} ({item.athlete_gender})</Text>
        <Text style={styles.leaderboardEntryTime}>{item.moving_time}s</Text>
      </TouchableOpacity>
    )
  }

  _keyExtractor (leaderboardEntry, index) {
    return leaderboardEntry.effort_id
  }

  render () {
    var content =
      <FlatList
        data={this.props.leaderboard}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor} />
    return (
      <Modal
        animationType='slide'
        visible={this.props.isOpen}
        onRequestClose={this.props.onClose}>
        {content}
        <Button title='close' onPress={this.props.onClose} />
      </Modal>
    )
  }
}

SegmentEffortSelectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  leaderboard: PropTypes.array.isRequired
}

const styles = {
  leaderbardEntry: {

  },
  leaderbardEntryRank: {

  },
  leaderbardEntryName: {

  },
  leaderbardEntryTime: {

  }
}
