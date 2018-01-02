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
import { Button } from '../../../button'

export class SegmentModal extends Component {
  constructor (props) {
    super(props)
    this._renderItem = this._renderItem.bind(this)
  }

  _renderItem ({ item, index, separators }) {
    console.log(item)
    return (
      <TouchableOpacity onPress={() => this.props.onSelect(item)} style={styles.segment}>
        <Text style={styles.segmentEffortLabel}>{item.name}</Text>
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
        <View style={[HelpStyles.content, HelpStyles.flexCol]}>
          <View>
            <View style={HelpStyles.headerBox}>
              <Text style={HelpStyles.header}>Select Segment</Text>
            </View>
            <FlatList
              data={this.props.segmentEfforts}
              renderItem={this._renderItem}
              keyExtractor={this._keyExtractor} />
          </View>
          <Button onPress={this.props.onClose} title='Cancel' />
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
    fontSize: 24,
    fontWeight: '400'
  },

  segment: {
    marginBottom: 10
  }
}
