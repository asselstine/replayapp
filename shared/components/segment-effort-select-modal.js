import React, {
  Component
} from 'react'
import {
  Modal,
  FlatList,
  TouchableOpacity,
  View,
  Text
} from 'react-native'
import PropTypes from 'prop-types'
import formatDuration from '../format-duration'
import moment from 'moment'
import Ionicon from 'react-native-vector-icons/Ionicons'
import { Button } from './button'
import ModalStyle from '../styles/modal'
import { Rank } from './rank'
import dpiNormalize from '../dpi-normalize'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'

export class SegmentEffortSelectModal extends Component {
  constructor (props) {
    super(props)
    this._renderItem = this._renderItem.bind(this)
  }

  _renderItem ({ item, index, separators }) {
    switch (item.athlete_gender) {
      case 'M':
        var genderIcon = <Ionicon name='ios-male' style={{...styles.genderIcon, ...styles.genderIconMale}} />
        break
      case 'F':
        genderIcon = <Ionicon name='ios-female' style={{...styles.genderIcon, ...styles.genderIconFemale}} />
        break
      default:
        genderIcon = <Text style={{...styles.genderIcon, ...styles.genderIconUnknown}}>?</Text>
    }

    return (
      <TouchableOpacity
        onPress={() => { this.props.onSelect(item) }}
        style={styles.leaderboardEntry}>
        <View style={styles.entrant}>
          <View style={styles.rank}>
            <Rank rank={item.rank} />
          </View>
          {genderIcon}
          <Text style={styles.leaderboardEntryName}>{item.athlete_name}</Text>
        </View>
        <View style={styles.leaderboardEntryTimeContainer}>
          <MaterialCommunityIcon style={styles.leaderboardEntryTime} name='clock' />
          <Text style={styles.leaderboardEntryTime}> {formatDuration(moment.duration(item.moving_time * 1000))}s</Text>
        </View>
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
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={this.props.onClose}>
        <View style={ModalStyle.header}>
          <Text style={ModalStyle.title}>Compare Effort</Text>
        </View>
        <View style={ModalStyle.body}>
          {content}
        </View>
        <View style={ModalStyle.footer}>
          <Button title='Close' onPress={this.props.onClose} style={styles.closeButton}/>
        </View>
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
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },

  entrant: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rank: {
    flex: 0,
    width: dpiNormalize(50),
  },

  genderIcon: {
    fontSize: dpiNormalize(20),
    paddingLeft: 10,
    paddingRight: 10,
    flex: 0,
    width: dpiNormalize(40),
  },

  genderIconMale: {
    color: '#2B60DE'
  },

  genderIconFemale: {
    color: 'pink'
  },

  genderIconUnknown: {
    color: 'purple'
  },

  leaderboardEntryName: {
    fontSize: dpiNormalize(18),
  },

  leaderboardEntryTimeContainer: {
    flexDirection: 'row',
  },

  leaderboardEntryTime: {
    fontSize: dpiNormalize(16)
  },

  closeButton: {
    color: 'red'
  }
}
