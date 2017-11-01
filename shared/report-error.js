import bugsnag from './bugsnag'

export default function (err) {
  console.log.apply(console, arguments)
  if (typeof err === 'string') {
    err = new Error(err)
  }
  bugsnag.notify.apply(bugsnag, [err])
}
