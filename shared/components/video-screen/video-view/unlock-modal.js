import React, {
  Component
} from 'react'
import {
  View,
  Text,
  Image
} from 'react-native'
import HelpStyles from '../../../styles/help'
import { HelpModal } from '../../help-modal'
import Icon from 'react-native-vector-icons/Ionicons'
import * as colours from '../../../colours'
import { HelpService } from '../../../services/help-service'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Button } from '../../button'

export class UnlockModal extends Component {
  constructor (props) {
    super(props)
    this._onDone = this._onDone.bind(this)
  }

  _onDone() {
    HelpService.seen('unlock')
  }

  render () {
    return (
      <HelpModal helpKey='unlock'>
        <View style={[HelpStyles.content, HelpStyles.flexCol]}>
          <View>
            <View style={[HelpStyles.headerBox]}>
              <Text style={[HelpStyles.header]}>Unlock Activity</Text>
            </View>
            <View style={[HelpStyles.block]}>
              <Text style={[HelpStyles.explain]}>You have unlocked the activity timeline:</Text>
            </View>
            <View style={[styles.plusContainer, HelpStyles.block]}>
              <MaterialCommunityIcon
                name='lock-open'
                style={styles.lockIcon} />
            </View>
            <View style={HelpStyles.block}>
              <Text style={HelpStyles.explain}>Now you can change the activity time independently of the video so that you can align them.</Text>
            </View>
            <View style={HelpStyles.block}>
              <Text style={HelpStyles.explain}>When you are happy with the result, you can lock it again:</Text>
            </View>
            <View style={[styles.plusContainer, HelpStyles.block]}>
              <MaterialCommunityIcon
                name='lock'
                style={styles.lockIcon} />
            </View>
          </View>
          <View style={[styles.button]}>
            <Button title='Got it!' onPress={this._onDone}/>
          </View>
        </View>
      </HelpModal>
    )
  }
}

const styles = {
  warningIcon: {
    fontSize: 48,
    color: 'red'
  },

  lockIcon: {
    fontSize: 48,
    color: 'black',
    alignSelf: 'center'
  },
}
