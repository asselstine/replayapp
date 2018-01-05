import React, {
  Component
} from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Path } from 'react-native-svg'
import { pointsToPath } from '../../svg'

export class RacePath extends Component {
  render () {
    var path = pointsToPath(this.props.points)
    return (
      <Path d={path} {...this.props} />
    )
  }
}

RacePath.propTypes = {
  points: PropTypes.array.isRequired
}
