import EventEmitter from 'EventEmitter'
import RNPhotosFramework from 'react-native-photos-framework'

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
      // this._libraryUnsubscribe = RNPhotosFramework.onLibraryChange(this._onLibraryChange.bind(this))
    }
  },

  _onLibraryChange () {
    this.emitter().emit('onLibraryChange')
  },

  emitter () {
    if (!this._eventEmitter) {
      this._eventEmitter = new EventEmitter()
    }
    return this._eventEmitter
  }
}
