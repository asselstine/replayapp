import EventEmitter from 'EventEmitter'
import RNPhotosFramework from 'react-native-photos-framework'

export const PhotosFramework = {
  init () {
    if (!this._libraryUnsubscribe) {
      this._libraryUnsubscribe = RNPhotosFramework.onLibraryChange(this._onLibraryChange.bind(this))
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
