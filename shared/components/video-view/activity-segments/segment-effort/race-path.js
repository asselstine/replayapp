import React, {
  Component
} from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Path } from 'react-native-svg'

export class RacePath extends Component {
  render () {
    var path = ''
    _.each(this.props.points, (point, index) => {
      if (index === 0) {
        path += `M${point[0]} ${point[1]} `
      } else {
        path += `L${point[0]} ${point[1]} `
      }
    })
    return (
      <Path d={path} {...this.props} />
    )
  }
}

RacePath.propTypes = {
  points: PropTypes.array.isRequired
}
