import React, { Component } from 'react'
import { DrawerItems } from 'react-navigation'
import {
  View,
  StyleSheet,
  ScrollView,
  Button,
  Text
} from 'react-native'
import _ from 'lodash'
import dpiNormalize from '../../../dpi-normalize'

export class Content extends Component {
  render () {
    var contentOptions = {
      labelStyle: {
        fontSize: dpiNormalize(18),
        color: 'red',
      },

      iconContainerStyle: {
        width: dpiNormalize(300),
      },
    }

    var props = _.merge({}, this.props, contentOptions)

    return (
      <View>
        <DrawerItems {...props} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
