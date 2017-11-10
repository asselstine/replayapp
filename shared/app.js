import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { store, persistor } from './store'
import { Navigator } from './components/navigator'
import { PersistGate } from 'redux-persist/es/integration/react'

export class App extends Component {
  render () {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <Navigator />
        </PersistGate>
      </Provider>
    )
  }
}
