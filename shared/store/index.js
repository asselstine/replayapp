import { createStore } from 'redux'
import { persistStore, persistCombineReducers } from 'redux-persist'
import storage from 'redux-persist/es/storage'
import reducers from '../reducers'

const config = {
  key: 'root',
  storage,
}

const reducer = persistCombineReducers(config, reducers)

// add `autoRehydrate` as an enhancer to your store (note: `autoRehydrate` is not a middleware)
export const store = createStore(reducer)

// begin periodically persisting the store
export const persistor = persistStore(store)
