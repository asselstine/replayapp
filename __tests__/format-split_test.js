import formatSplit from '../shared/format-split'
import moment from 'moment'
/* global describe, it, expect */

describe('formatSplit', () => {
  it('can format minutes', () => {
    expect(formatSplit(moment.duration(60 * 1000 * 5)))
      .toEqual('+5:00.00')
  })

  it('can format seconds', () => {
    expect(formatSplit(moment.duration(3 * 60 * 1000 + 34 * 1000)))
      .toEqual('+3:34.00')
  })

  it('can format just seconds', () => {
    expect(formatSplit(moment.duration(34 * 1000 + 123)))
      .toEqual('+0:34.12')
  })

  it('can deal with pure ms', () => {
    expect(formatSplit(-552314))
      .toEqual('-9:12.31')
  })
})
