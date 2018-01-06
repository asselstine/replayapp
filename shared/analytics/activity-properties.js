import _ from 'lodash'

export default function (activity) {
  return _.pick(activity,
    [
      'id'
    ]
  )
}
