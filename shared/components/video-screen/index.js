import React, { Component } from 'react'
import { VideoView } from './video-view'
import { connect } from 'react-redux'
import { store } from '../../store'
import _ from 'lodash'

export const VideoScreen = connect(
  (state, ownProps) => {
    const { localIdentifier, title } = ownProps.navigation.state.params
    var activityName = _.get(state, `videos[${localIdentifier}].activity.name`)
    var result = _.merge({}, ownProps, { localIdentifier, activityName, title })
    return result
  }
)(class extends Component {
  constructor (props) {
    super(props)
    this._onClose = this._onClose.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    const { title } = nextProps.navigation.state.params
    if (nextProps.activityName && nextProps.activityName !== title) {
      nextProps.navigation.setParams({ title: nextProps.activityName })
    }
  }

  _onClose () {
    this.props.navigation.goBack()
  }

  render () {
    return <VideoView localIdentifier={this.props.localIdentifier} onClose={this._onClose} />
  }
})

VideoScreen.navigationOptions = (props) => {
  // const { params } = props.navigation.state
  // var activityName = _.get(store.getState(), `videos[${params.localIdentifier}].activity.name`)
  return {
    header: null
  }
}
