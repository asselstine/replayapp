import formatDuration from '../shared/format-duration'
import moment from 'moment'
/* global describe, it, expect */

describe('formatDuration', () => {
  it('expects to format with hour', () => {
    expect(formatDuration(moment.duration(3600 * 1000)))
      .toEqual('1:00:00')
  })

  it('expects to format with no hour', () => {
    expect(formatDuration(moment.duration(3 * 60 * 1000 + 34 * 1000)))
      .toEqual('03:34')
  })
})
