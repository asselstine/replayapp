function pad2 (number) {
  return ('' + number).padStart(2, '0')
}

export default function (duration) {
  var hours = ''
  var minutes = ''
  if (duration.asHours() >= 1) {
    hours = `${duration.hours()}:`
    var minutes = `${pad2(duration.minutes())}:`
  } else {
    if (duration.minutes() > 0) {
      minutes = `${duration.minutes()}:`
    }
  }
  return `${hours}${minutes}${duration.seconds()}.${Math.round(duration.milliseconds() / 10)}`
}
