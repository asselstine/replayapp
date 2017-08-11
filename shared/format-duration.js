function pad2 (number) {
  return ('' + number).padStart(2, '0')
}

export default function (duration) {
  var hours = ''
  if (duration.asHours() >= 1) {
    hours = `${duration.hours()}:`
  }
  return `${hours}${pad2(duration.minutes())}:${pad2(duration.seconds())}`
}
