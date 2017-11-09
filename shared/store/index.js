import { compose, createStore } from 'redux'
import { persistStore, autoRehydrate } from 'redux-persist'
// react-native
import { AsyncStorage } from 'react-native'

import reducer from '../reducer'

// add `autoRehydrate` as an enhancer to your store (note: `autoRehydrate` is not a middleware)
export const store = createStore(
  reducer,
  undefined,
  compose(
    autoRehydrate()
  )
)

// begin periodically persisting the store
export const persistor = persistStore(store, {storage: AsyncStorage})
