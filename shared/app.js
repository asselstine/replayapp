import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import { Navigator } from './components/navigator'

export class App extends Component {
  render () {
    return (
      <Provider store={store}>
        <Navigator />
      </Provider>
    )
  }
}
