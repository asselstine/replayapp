import React, {
  Component
} from 'react'
import { streamPoints, zeroScreenY } from '../../../../svg'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Path } from 'react-native-svg'

export class RacePath extends Component {
  render () {
    var points = streamPoints(this.props.height, this.props.width, this.props.distanceStream, this.props.deltaTimeStream)
    var zeroY = zeroScreenY(this.props.height, this.props.deltaTimeStream)
    points.unshift([0, zeroY])
    points.push([this.props.width, zeroY])
    // console.log(zeroY)
    var path = ''
    _.each(points, (point, index) => {
      if (index === 0) {
        path += `M${point[0]} ${point[1]} `
      } else {
        path += `L${point[0]} ${point[1]} `
      }
    })
    // path += 'Z'

    return (
      <Path d={path} {...this.props} />
    )
  }
}

RacePath.propTypes = {
  distanceStream: PropTypes.array.isRequired,
  deltaTimeStream: PropTypes.array.isRequired,
  width: PropTypes.any.isRequired,
  height: PropTypes.any.isRequired
}
