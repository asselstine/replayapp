import { StackNavigator } from 'react-navigation'

import { LinkedVideosScreen } from './linked-videos-screen'
import { VideoScreen } from './video-screen'
import { NavigationEventEmitter } from './navigation-event-emitter'
import { screen } from '../analytics'
import reportError from '../report-error'
import _ from 'lodash'

export const Navigator = StackNavigator(
  {
    LinkedVideos: { screen: LinkedVideosScreen },
    Video: { screen: VideoScreen }
  },
  {
    initialRouteName: 'LinkedVideos',
    onTransitionEnd: (event) => {
      reportError('!!!! ANOTHER TEST')
      NavigationEventEmitter.emit('transitionEnd', event)
      console.log(event.scene)
      screen({
        name: event.scene.route.routeName,
        properties: event.scene.route.params
      })
    }
  }
)
