import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Entypo from 'react-native-vector-icons/Entypo'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native'

export class Tabs extends Component {
  renderTab(name, page, isTabActive, onPressHandler) {
    const dotStyle = isTabActive ? styles.activeDot : styles.inactiveDot;

    return (
      <TouchableOpacity
        style={{flex: 0}}
        key={name}
        accessible={true}
        accessibilityLabel={name}
        accessibilityTraits='button'
        onPress={() => onPressHandler(page)}>
        <Entypo name='dot-single' style={[styles.dot, dotStyle]}/>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={styles.tabs}>
        {this.props.tabs.map((name, page) => {
          const isTabActive = this.props.activeTab === page;
          return this.renderTab(name, page, isTabActive, this.props.goToPage);
        })}
      </View>
    )
  }
}

const styles = {
  tabs: {
    flexDirection: 'row',
    flex: 0,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dot: {
    fontSize: 32
  },

  activeDot: {
    color: 'blue',
    opacity: 0.9
  },

  inactiveDot: {
    color: 'grey',
    opacity: 0.5
  }
}

Tabs.propTypes = {
  goToPage: PropTypes.func,
  activeTab: PropTypes.number,
  tabs: PropTypes.array
}
