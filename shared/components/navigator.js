import { StackNavigator } from 'react-navigation'

import { LinkedVideosScreen } from './linked-videos-screen'
import { VideoScreen } from './video-screen'
import { NavigationEventEmitter } from './navigation-event-emitter'

export const Navigator = StackNavigator(
  {
    LinkedVideos: { screen: LinkedVideosScreen },
    Video: { screen: VideoScreen }
  },
  {
    initialRouteName: 'LinkedVideos',
    onTransitionEnd: (event) => {
      NavigationEventEmitter.emit('transitionEnd', event)
    }
  }
)
