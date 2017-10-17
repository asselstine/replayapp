import moment from 'moment'

export const SegmentEffort = {
  startDate (segmentEffort) {
    return moment(segmentEffort.start_date)
  },

  endDate (segmentEffort) {
    return this.dates(segmentEffort).end
  },

  dates (segmentEffort) {
    var start = this.startDate(segmentEffort)
    var end = moment(start).add(segmentEffort.elapsed_time, 's')
    return { start, end }
  }
}
