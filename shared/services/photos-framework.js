import EventEmitter from 'EventEmitter'
import RNPhotosFramework from 'react-native-photos-framework'
import { store } from '../store'
import dispatchTrack from '../store/dispatch-track'
import { removeVideo } from '../actions/video-actions'
import _ from 'lodash'

export const PhotosFramework = {
  auth () {
    var promise = RNPhotosFramework.requestAuthorization()
    promise.then((response) => {
      if (response.isAuthorized) {
        this.init()
      }
    })
    return promise
  },

  init () {
    if (!this._libraryUnsubscribe) {
      this._libraryUnsubscribe = RNPhotosFramework.onLibraryChange(this._onLibraryChange.bind(this))
    }
  },

  _onLibraryChange () {
    this.emitter().emit('onLibraryChange')
    this.checkVideos(_.values(store.getState().videos))
  },

  checkVideos (videos) {
    var localIdentifiers = _.map(videos, 'rawVideoData.localIdentifier')
    RNPhotosFramework
      .getAssetsResourcesMetadata(localIdentifiers)
      .then((assets) => {
        var deleted = _.difference(localIdentifiers, _.keys(assets))
        deleted.forEach((localIdentifier) => {
          dispatchTrack(removeVideo({
            rawVideoData: {
              localIdentifier: localIdentifier
            }
          }),
          {
            localIdentifier: localIdentifier
          })
        })
      })
  },

  emitter () {
    if (!this._eventEmitter) {
      this._eventEmitter = new EventEmitter()
    }
    return this._eventEmitter
  }
}
