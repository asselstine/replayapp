// inspired by https://stackoverflow.com/questions/18900642/get-point-on-a-path-or-polyline-which-is-closest-to-a-disconnected-point

import _ from 'lodash'

export function sortedIndexDistances (latLng, latLngs) {
  var indexDistances = _.map(latLngs, (elem, index) => {
    return {
      index: index,
      distance: distance(latLng, elem)
    }
  })
  return _.sortBy(indexDistances, (elem) => elem.distance)
}

function subtract (startLatLng, endLatLng) {
  return {
    latitude: endLatLng.latitude - startLatLng.latitude,
    longitude: endLatLng.longitude - startLatLng.longitude
  }
}

function distance (startLatLng, endLatLng) {
  var a = endLatLng.latitude - startLatLng.latitude
  var b = endLatLng.longitude - startLatLng.longitude
  return a * a + b * b
}

function dotProduct (latLngA, latLngB) {
  return latLngA.latitude * latLngB.latitude + latLngA.longitude * latLngB.longitude
}

export function fractionAlongPath (startLatLng, endLatLng, latLng) {
  var length = distance(startLatLng, endLatLng)
  if (length === 0.0) {
    return 0.0
  }
  var fraction = dotProduct(subtract(latLng, startLatLng), subtract(endLatLng, startLatLng)) / length
  if (fraction > 1) {
    return 1
  }
  if (fraction < 0) {
    return 0
  }
  return fraction
}

export function pointFromFraction (startLatLng, endLatLng, fraction) {
  return {
    latitude: startLatLng.latitude + (endLatLng.latitude - startLatLng.latitude) * fraction,
    longitude: startLatLng.longitude + (endLatLng.longitude - startLatLng.longitude) * fraction
  }
}

export function closestPoint (latLng, latLngs) {
  var distances = sortedIndexDistances(latLng, latLngs)
  var startDistance, endDistance
  if (distances[0].index > distances[1].index) {
    startDistance = distances[1]
    endDistance = distances[0]
  } else {
    startDistance = distances[0]
    endDistance = distances[1]
  }
  var startLatLng = latLngs[startDistance.index]
  var endLatLng = latLngs[endDistance.index]
  var fraction = fractionAlongPath(startLatLng, endLatLng, latLng)
  var point = pointFromFraction(startLatLng, endLatLng, fraction)
  return {
    point: point,
    startIndex: startDistance.index,
    endIndex: endDistance.index,
    fraction: fraction,
    distance: Math.sqrt(distance(point, latLng))
  }
}
