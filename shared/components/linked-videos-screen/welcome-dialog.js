import React, {
  Component
} from 'react'
import {
  View,
  Text,
  Button,
  Image
} from 'react-native'
import HelpStyles from '../../styles/help'
import { HelpModal } from '../help-modal'
import Icon from 'react-native-vector-icons/Ionicons'
import stravaLogo from '../../../images/strava-logo.png'
import overlayImage from '../../../images/overlay.jpg'
import noOverlayImage from '../../../images/no-overlay.jpg'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import * as colours from '../../colours'
import { Tabs } from '../help-modal/tabs'

import { HelpService } from '../../services/help-service'

export class WelcomeDialog extends Component {
  constructor (props) {
    super(props)
    this._onDone = this._onDone.bind(this)
  }

  _onDone() {
    HelpService.seen('firstContact3')
  }

  render () {
    return (
      <HelpModal helpKey='firstContact3'>
        <ScrollableTabView
          renderTabBar={(props) => <Tabs {...props} />}
          tabBarPosition='bottom'
          prerenderingSiblingsNumber={Infinity}
          tabBarActiveTextColor={colours.STRAVA_BRAND_COLOUR}
          tabBarUnderlineStyle={{backgroundColor: colours.STRAVA_BRAND_COLOUR}}>
          <View tabLabel='intro'>
            <Text style={HelpStyles.header}>Welcome to Replay Race Media</Text>
            <View style={styles.plusContainer}>
              <Image style={styles.noOverlayImage} source={noOverlayImage} resizeMode='contain' />
              <Icon style={styles.addIcon} name='ios-add' />
              <Image style={styles.stravaImage} source={stravaLogo} resizeMode='contain' />
            </View>
            <Text style={styles.headerIcon}>=</Text>
            <Image style={styles.image} source={overlayImage} resizeMode='contain' />
          </View>
          <View tabLabel='activity'>
            <Text style={HelpStyles.header}>Let’s Get Started</Text>
            <Text>Add videos using the add button</Text>
            <Text>Remove videos by pressing and holding on them</Text>

            <Button title='Ok!' onPress={this._onDone} />
          </View>
        </ScrollableTabView>
      </HelpModal>
    )
  }
}

const styles = {
  plusContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  stravaImage: {
    width: '44%',
    height: 50
  },

  addIcon: {
    width: '12%',
    fontSize: 48,
    textAlign: 'center'
  },

  noOverlayImage: {
    width: '44%',
    height: 100
  },

  headerIcon: {
    fontSize: 48,
    textAlign: 'center'
  },

  halfImage: {
    width: '50%',
    height: 50
  },
  image: {
    width: '100%',
    height: 200
  }
}
