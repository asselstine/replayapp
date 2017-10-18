import {
  createBoundsTransform
} from './streams'
import _ from 'lodash'
import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath'

export const pointsToPath = function (points) {
  var path = ''
  _.each(points, (point, index) => {
    if (index === 0) {
      path += `M${point[0]} ${point[1]} `
    } else {
      path += `L${point[0]} ${point[1]} `
    }
  })
  path += 'Z'
  return path
}

export const pointsToPolyline = function (points) {
  var polyline = ''
  _.each(points, (point) => {
    polyline += `${point[0]},${point[1]} `
  })
  return polyline
}

export const viewportTransform = function (x1, width1, x2, width2) {
  var scaleX = width2 / (1.0 * width1)
  var translateX = x2 - x1

  var translate = MatrixMath.createTranslate2d(-x2, 0)
  var scale = MatrixMath.createIdentityMatrix()

  MatrixMath.reuseScale3dCommand(scale, scaleX, 1, 1)
  MatrixMath.multiplyInto(scale, scale, translate)
  MatrixMath.reuseTranslate2dCommand(translate, x2, 0)
  MatrixMath.multiplyInto(scale, translate, scale)

  MatrixMath.reuseTranslate2dCommand(translate, translateX, 0)
  var result = MatrixMath.createIdentityMatrix()
  MatrixMath.multiplyInto(result, scale, translate)
  return result
}

export const transformPoints = function (points, transform) {
  return points.map((point) => {
    var vx = MatrixMath.multiplyVectorByMatrix([point[0], point[1], 0, 1], transform)
    return [vx[0], vx[1]]
  })
}

export const mergeStreams = function (xStream, yStream) {
  return _.zip(xStream, yStream)
}

export const streamPoints = function (height, width, xStream, yStream) {
  // the transform can turn world -> screen coordinates
  var transform = createBoundsTransform(xStream, yStream, 0, height, width, -height)
  var points = mergeStreams(xStream, yStream)
  return transformPoints(points, transform)
  // return []
}

export const streamToPoints = function (height, width, timeStream, dataStream) {
  var boundsTransform = createBoundsTransform(timeStream, dataStream, 0, height, width, -height)
  var points = mergeStreams(timeStream, dataStream)
  points = transformPoints(points, boundsTransform)
  points.unshift([0, height])
  points.push([width, height])
  return points
}

export const transformStreamPointsToPath = function (points, transform) {
  var points = transformPoints(points, transform)
  return pointsToPath(points)
}

export const streamPath = function (height, width, timeStream, dataStream, transform) {
  var points = streamToPoints(height, width, timeStream, dataStream)
  return transformStreamPointsToPath(points, transform)
}

export const zeroScreenY = function (height, yStream) {
  var yMin = Math.min(...yStream)
  var yMax = Math.max(...yStream)

  var zeroScale = yMin / (yMax - yMin)
  return zeroScale * height + height
}
