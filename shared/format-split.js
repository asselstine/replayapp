function pad2 (number) {
  return ('' + number).padStart(2, '0')
}

export default function (duration) {
  var hours = ''
  var minutes = ''
  var sign = ''
  if (duration.asHours() >= 1) {
    hours = `${Math.abs(duration.hours())}:`
    var minutes = `${pad2(Math.abs(duration.minutes()))}:`
  } else {
    if (duration.minutes() > 0) {
      minutes = `${Math.abs(duration.minutes())}:`
    }
  }
  if (duration.milliseconds() < 0) {
    sign = '-'
  }
  return `${sign}${hours}${minutes}${Math.abs(duration.seconds())}.${Math.abs(Math.round(duration.milliseconds() / 10))}`
}
