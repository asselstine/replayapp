import _ from 'lodash'
import moment from 'moment'
import { store } from './store'

export default function (cacheKey) {
    var caches = _.get(store.getState(), 'cache') || {}
    var date = caches[cacheKey]
    if (!date) {
      var result = true
    } else {
      result = moment().isAfter(moment(date).add(7, 'days'))
    }
    // console.log(`CACHE EXPIRED: ${result}: ${cacheKey}`)
    return result
}
