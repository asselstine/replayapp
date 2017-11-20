import moment from 'moment'

function pad2 (number) {
  return ('' + number).padStart(2, '0')
}

export default function (duration) {
  // throw new Error('duration: ', typeof duration, duration)
  if (typeof duration === 'string' || typeof duration === 'number') {
    duration = moment.duration(duration)
  }
  var hours = ''
  if (duration.asHours() >= 1) {
    hours = `${duration.hours()}:`
    var minutes = pad2(duration.minutes())
  } else {
    minutes = duration.minutes()
  }
  return `${hours}${minutes}:${pad2(duration.seconds())}`
}
