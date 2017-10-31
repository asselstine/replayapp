import _ from 'lodash'

export default function (segmentEffort) {
  return _.pick(segmentEffort, [
    'id',
    'name'
  ])
}
