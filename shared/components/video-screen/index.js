import React, { Component } from 'react'
import { VideoView } from './video-view'
import { connect } from 'react-redux'
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

  _toggleHeader () {
    this.props.navigation.setParams({
      hideHeader:
        !this.props.navigation.state.params ||
        !this.props.navigation.state.params.hideHeader,
    })
  }

  render () {
    return <VideoView localIdentifier={this.props.localIdentifier} onClose={this._onClose} onToggleFullscreen={this._toggleHeader.bind(this)}/>
  }
})

VideoScreen.navigationOptions = ({ navigation }) => {
  const hideHeader =
    navigation.state.params && navigation.state.params.hideHeader
  return {
    header: hideHeader ? null : undefined,
    title: 'Video'
  }
}
