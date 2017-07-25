// Taken from http://www.jacklmoore.com/notes/rounding-in-javascript/

export function round (value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}
