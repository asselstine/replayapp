import bugsnag from './bugsnag'

export default function (err) {
  console.log(err)
  if (err) {
    if (!err.stack) {
      err = new Error(err)
    }
    bugsnag.notify.apply(bugsnag, [err])
  }
}
