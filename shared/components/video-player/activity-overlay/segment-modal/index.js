import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Modal
} from 'react-native'
import HelpStyles from '../../../../styles/help'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import { Button } from '../../../button'
import moment from 'moment'
import ModalStyles from '../../../../styles/modal'
import formatDuration from '../../../../format-duration'
import formatDistance from '../../../../format-distance'
import { PrRank } from '../../../pr-rank'
import dpiNormalize from '../../../../dpi-normalize'

export class SegmentModal extends Component {
  constructor (props) {
    super(props)
    this._renderItem = this._renderItem.bind(this)
  }

  _renderItem ({ item, index, separators }) {
    // console.log(item)

    if (item.pr_rank) {
      var prRank = <PrRank prRank={item.pr_rank} size={20} />
    }

    return (
      <TouchableOpacity onPress={() => this.props.onSelect(item)} style={styles.segment}>
        <View style={styles.segmentLeftPane}>
          <Text style={styles.segmentEffortLabel}>{item.name}</Text>
        </View>
        <View style={styles.segmentRightPane}>
          <View style={styles.activityDetails}>
            <View style={styles.activityDetailItem}>
              <MaterialCommunityIcon style={styles.activityDetailIcon} name='clock' />
              <Text style={styles.activityDetailLabel}>{formatDuration(moment.duration(item.moving_time * 1000))}</Text>
            </View>
            <View style={styles.activityDetailItem}>
              <Entypo style={styles.activityDetailIcon} name='ruler' />
              <Text style={styles.activityDetailLabel}>{formatDistance(item.distance)}</Text>
            </View>
            <View style={styles.activityDetailItem}>
              {prRank}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  _keyExtractor (segmentEffort, index) {
    return segmentEffort.id
  }

  render () {
    return (
      <Modal
        animationType='slide'
        visible={this.props.isOpen}
        supportedOrientations={['portrait', 'landscape']}>
        <View style={[HelpStyles.flexCol]}>
          <View>
            <Text style={ModalStyles.title}>Select Segment</Text>
            <View style={HelpStyles.content}>
              <FlatList
                data={this.props.segmentEfforts}
                renderItem={this._renderItem}
                keyExtractor={this._keyExtractor} />
            </View>
          </View>
          <View style={ModalStyles.footer}>
            <Button onPress={this.props.onClose} title='Cancel' />
          </View>
        </View>
      </Modal>
    )
  }
}

SegmentModal.propTypes = {
  segmentEfforts: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
}

const styles = {
  segmentEffortLabel: {
    fontSize: dpiNormalize(18),
    fontWeight: '300'
  },

  segment: {
    paddingBottom: 20,
    flexDirection: 'row',
  },

  segmentRightPane: {
    width: dpiNormalize(70),
    flexDirection: 'column',
    alignItems: 'flex-end'
  },

  segmentLeftPane: {
    flex: 1,
  },

  activityName: {
    fontSize: dpiNormalize(24),
  },

  activityDetails: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  },

  activityDetailIcon: {
    paddingRight: 4,
    fontSize: dpiNormalize(14),
  },

  activityDetailLabel: {
    fontSize: dpiNormalize(14),
  },

  activityDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}
