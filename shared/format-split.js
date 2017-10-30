function pad2 (number) {
  return ('' + number).padStart(2, '0')
}

export default function (duration) {
  var hours = ''
  var minutes = ''
  var sign = ''
  var seconds = `${pad2(Math.abs(duration.seconds()))}`
  if (duration.asHours() >= 1) {
    hours = `${Math.abs(duration.hours())}:`
    var minutes = `${pad2(Math.abs(duration.minutes()))}:`
  } else if (duration.minutes() > 0) {
    minutes = `${Math.abs(duration.minutes())}:`
  } else {
    seconds = Math.abs(duration.seconds())
  }
  if (duration.milliseconds() < 0) {
    sign = '-'
  }
  return `${sign}${hours}${minutes}${seconds}.${Math.abs(Math.round(duration.milliseconds() / 10))}`
}
