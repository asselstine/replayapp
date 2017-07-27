import React, { Component } from 'react'
import {
  Modal,
  Button,
  View,
  Slider
} from 'react-native'
import PropTypes from 'prop-types'
import Video from 'react-native-video'
import _ from 'lodash'
import moment from 'moment'
import { ActivityMap } from '../activity-map'
import { StreamsService } from '../../../services/streams-service'

export class SyncModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      paused: true,
      duration: 0,
      orientation: 'landscape',
      width: 1,
      height: 1,
      mapCurrentLatLng: null,
      time: 0
    }
    this.mapTimeOffset = 0
    this.videoTimeOffset = 0
    this.onLoad = this.onLoad.bind(this)
    this.onPressVideo = this.onPressVideo.bind(this)
    this._onValueChangeVideo = this._onValueChangeVideo.bind(this)
    this._onValueChangeMap = _.throttle(this._onValueChangeMap.bind(this), 100)
    this._onSave = this._onSave.bind(this)
  }

  onLoad (e) {
    this.setState({
      duration: e.duration,
      orientation: e.naturalSize.orientation,
      width: e.naturalSize.width,
      height: e.naturalSize.height
    })
  }

  onPressVideo (e) {
    if (this.state.paused) {
      this.player.seek(0)
    }
    this.setState({ paused: !this.state.paused })
  }

  _onSave () {
    var offset = this.mapTimeOffset - this.videoTimeOffset
    var activityStartAt = moment(this.props.activity.start_date)
    var videoStartAt = activityStartAt.clone().add(offset, 's')
    this.props.onSave(videoStartAt)
  }

  _onValueChangeVideo (value) {
    var position = value * (this.state.duration || 0)
    this.player.seek(position)
    this.videoTimeOffset = position
  }

  _onValueChangeMap (value) {
    this.setState({
      time: value
    })
  }

  componentDidMount () {
    this.retrieveStream(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (_.get(this.props, 'activity.id') !== _.get(nextProps, 'activity.id')) {
      this.retrieveStream(nextProps)
    }
  }

  retrieveStream (props) {
    if (!_.get(props, 'activity.id')) {
      return
    }
    StreamsService.retrieveStreams(props.activity.id)
  }

  _onStreamTimeChange (streamTime) {
    if (this.state.locked) {
      // otherwise, update the video current time and stream time
    } else {
      // update the video start at
      // console.log('update: ', streamTime, this.player.currentTime)
    }
  }

  render () {
    let aspectRatio = (this.state.width * 1.0) / this.state.height
    let videoStyle = {
      width: '100%',
      aspectRatio: aspectRatio,
      maxHeight: 200
    }

    if (this.props.rawVideoData) {
      var video =
        <Video
          source={this.props.rawVideoData.video}
          onLoad={this.onLoad}
          ref={(ref) => { this.player = ref }}
          paused={this.state.paused}
          style={videoStyle}
          resizeMode='fill'
          />
    }

    var mapView =
      <ActivityMap
        activity={this.props.activity}
        latlngStream={this.props.latlngStream}
        timeStream={this.props.timeStream}
        onStreamTimeChange={(streamTime) => { console.log('whhoooo', streamTime) }}
        streamTime={this.state.time} />

    return (
      <Modal
        animationType='slide'
        transparent={false}
        visible={this.props.isOpen}
        onRequestClose={this.props.onClose}>
        {video}
        <Slider onValueChange={this._onValueChangeVideo} />
        {mapView}
        <Slider onValueChange={this._onValueChangeMap} />
        <View style={{marginTop: 22, flexDirection: 'row', flex: 1, justifyContent: 'space-between'}}>
          <Button
            style={{padding: 20}}
            onPress={this.props.onClose}
            title='Cancel'
            color='#FF0000' />
          <Button
            style={{padding: 20}}
            onPress={this._onSave}
            title='Save'
            color='#00FF00' />
        </View>
      </Modal>
    )
  }
}

SyncModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  rawVideoData: PropTypes.object.isRequired,
  activity: PropTypes.object.isRequired,
  latlngStream: PropTypes.object,
  timeStream: PropTypes.object
}
