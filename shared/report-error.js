import bugsnag from './bugsnag'

export default function (err) {
  console.log.apply(console, arguments)
  if (err) {
    if (!err.stack) {
      err = new Error(err)
    }
    bugsnag.notify.apply(bugsnag, [err])
  }
}
