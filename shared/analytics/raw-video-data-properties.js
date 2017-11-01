import _ from 'lodash'

export default function (rawVideoData) {
  return _.pick(rawVideoData,
    [
      'duration',
      'sourceType',
      'height',
      'width',
      'mediaType',
      'localIdentifier',
      'modificationDateUTCSeconds',
      'creationDateUTCSeconds'
    ]
  )
}
