import React, { Component } from 'react'
import { DrawerItems } from 'react-navigation'
import {
  View,
  StyleSheet,
  ScrollView,
  Text
} from 'react-native'

export class Content extends Component {
  render () {
    return (
      <View>
        <DrawerItems {...this.props} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
