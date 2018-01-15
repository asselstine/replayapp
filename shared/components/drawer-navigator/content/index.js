import React, { Component } from 'react'
import { DrawerItems } from 'react-navigation'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text
} from 'react-native'
import _ from 'lodash'
import dpiNormalize from '../../../dpi-normalize'
import { connect } from 'react-redux'
import { logout } from '../../../actions/strava-actions'
import { store } from '../../../store'
import { Button } from '../../button'

export const Content = connect(
  (state, ownProps) => {
    return {
      credentials: _.get(state, 'strava.credentials')
    }
  }
)(class extends Component {
  constructor (props) {
    super(props)
    this.signOut = this.signOut.bind(this)
  }

  signOut () {
    store.dispatch(logout())
    this.props.navigation.navigate('DrawerClose')
  }

  render () {
    var labelStyle = {
      fontSize: dpiNormalize(18),
      color: 'red',
      fontWeight: '400',
    }

    var contentOptions = {
      labelStyle: labelStyle,
      iconContainerStyle: {
        width: dpiNormalize(300),
      },
    }

    var props = _.merge({}, this.props, contentOptions)

    if (this.props.credentials) {
      var signOut =
        <TouchableOpacity style={styles.signOut} onPress={this.signOut}>
          <Text style={labelStyle}>Sign Out</Text>
        </TouchableOpacity>
    }

    return (
      <View style={styles.container}>
        <DrawerItems {...props} style={styles.items} />
        {signOut}
      </View>
    )
  }
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flex: 1,
  },
  //
  // items: {
  //   flex: 1
  // },

  signOut: {
    paddingTop: 10,
    paddingLeft: 15,
  },

  footer: {
    flex: 0,
  },
});
