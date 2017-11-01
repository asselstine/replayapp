import _ from 'lodash'

export default function (activity) {
  return _.pick(activity,
    [
      'id',
      'start_date',
      'moving_time',
      'elapsed_time'
    ]
  )
}
