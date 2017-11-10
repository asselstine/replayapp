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

export class ConnectDialog extends Component {
  _onDone() {
    HelpService.seen('connectVideoToStrava')
  }

  render () {
    return (
      <HelpModal helpKey='connectVideoToStrava'>
        <View style={[HelpStyles.content, HelpStyles.flexCol]}>
          <View>
            <Text style={HelpStyles.explain}>To attach the video to a Strava activity, use the connect button:</Text>
            <View style={HelpStyles.block}>
              <Image
                resizeMode='contain'
                style={styles.connectStravaButton}
                source={connectWithStrava} />
            </View>
            <Text style={HelpStyles.explain}>The activity should overlap with the video.</Text>
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
    justifySelf: 'center',
    width: 193,
    padding: 50,
  }
}
