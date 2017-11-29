import moment from 'moment'

function pad2 (number) {
  return ('' + number).padStart(2, '0')
}

export default function (duration) {
  if (typeof duration !== 'object') {
    duration = moment.duration(duration)
  }
  var hours = ''
  var minutes = '0:'
  var sign = ''
  var seconds = `${pad2(Math.abs(duration.seconds()))}`
  if (duration.asHours() >= 1) {
    hours = `${Math.abs(duration.hours())}:`
    minutes = `${pad2(Math.abs(duration.minutes()))}:`
  } else if (duration.minutes() > 0) {
    minutes = `${Math.abs(duration.minutes())}:`
  }
  if (duration.milliseconds() < 0) {
    sign = '-'
  } else {
    sign = '+'
  }
  return `${sign}${hours}${minutes}${seconds}.${pad2(Math.abs(Math.round(duration.milliseconds() / 10)))}`
}
