import React, {
  Component
} from 'react'
import {
  View,
  Image,
  Button,
  Text
} from 'react-native'
import PropTypes from 'prop-types'

import { HelpModal } from '../../../help-modal'
import HelpStyles from '../../../../styles/help'
import { HelpService } from '../../../../services/help-service'

import { connectWithStrava } from '../../../../images'

export class ConnectHelpModal extends Component {
  _onDone() {
    HelpService.seen('connectVideoToStrava')
  }

  render () {
    return (
      <HelpModal helpKey='connectVideoToStrava'>
        <View style={[HelpStyles.content, HelpStyles.flexCol]}>
          <View>
            <View style={HelpStyles.headerBox}>
              <Text style={HelpStyles.header}>Connect Strava</Text>
            </View>
            <Text style={[HelpStyles.block, HelpStyles.explain]}>To attach the video to a Strava activity, use the connect button:</Text>
            <View style={HelpStyles.block}>
              <Image
                resizeMode='contain'
                style={styles.connectStravaButton}
                source={connectWithStrava} />
            </View>
            <Text style={[HelpStyles.block, HelpStyles.explain]}>The video should have been taken during the activity.</Text>
            <Text style={[HelpStyles.block, HelpStyles.explain]}>If you haven’t authorized with Strava yet, you will be asked to authorize this app.</Text>
          </View>
          <View style={HelpStyles.block}>
            <Button title='Got it!' onPress={() => this._onDone()}/>
          </View>
        </View>
      </HelpModal>
    )
  }
}

const styles = {
  connectStravaButton: {
    alignSelf: 'center',
    width: 193,
    padding: 50,
  }
}
