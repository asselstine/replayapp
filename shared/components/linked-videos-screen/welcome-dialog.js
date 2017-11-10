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
import ScrollableTabView from 'react-native-scrollable-tab-view'
import * as colours from '../../colours'
import { Tabs } from '../help-modal/tabs'
import { HelpService } from '../../services/help-service'

import {
  replayRedLogo,
  overlayImage
} from '../../images'

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
          <View tabLabel='intro' style={HelpStyles.content}>
            <View style={styles.block}>
              <Image style={styles.logo} source={replayRedLogo} resizeMode='contain' />
            </View>
            <View style={styles.block}>
              <Text style={HelpStyles.explain}>Replay brings</Text>
              <Text style={HelpStyles.explainBold}>interactive telemetry</Text>
              <Text style={HelpStyles.explain}>and</Text>
              <Text style={HelpStyles.explainBold}>race playback</Text>
              <Text style={HelpStyles.explain}>to your videos</Text>
            </View>
            <View style={styles.block}>
              <Image style={styles.overlay} source={overlayImage} resizeMode='contain' />
            </View>
          </View>
          <View tabLabel='activity' style={[HelpStyles.flexCol, HelpStyles.content]}>
            <View style={styles.flexItem}>
              <Text style={[styles.block, HelpStyles.explain]}>To get started select a video in your library using the add button:</Text>
            </View>
            <View style={[styles.flexItem, styles.plusContainer]}>
              <Icon style={styles.addIcon} name='ios-add' />
            </View>
            <View style={styles.flexItem}>
              <Text style={HelpStyles.explain}>The video should be a single continuous shot for best results.</Text>
            </View>
            <View style={styles.flexItem}>
              <Text style={HelpStyles.explain}>To remove a video, press and hold on the video thumbnail.</Text>
            </View>
            <View style={[styles.flexItem, styles.button]}>
              <Button title='Got it!' onPress={this._onDone}/>
            </View>
          </View>
        </ScrollableTabView>
      </HelpModal>
    )
  }
}

const styles = {
  flexItem: {
    flex: 1,
  },

  logo: {
    width: '20%',
    aspectRatio: 0.82468,
    height: 'auto',
  },

  overlay: {
    width: '100%',
    aspectRatio: 1.779,
    height: 'auto'
  },

  overlayContainer: {
    width: '100%',
    height: 150
  },

  plusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },

  addIcon: {
    width: '12%',
    fontSize: 48,
    textAlign: 'center'
  },
}
