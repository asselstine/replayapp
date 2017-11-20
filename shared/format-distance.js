import { round } from './round'

export default function (metres) {
  if (metres < 1000) {
    var result = `${metres} m`
  } else {
    result = `${round(metres / 1000, 2)} km`
  }
  return result
}
