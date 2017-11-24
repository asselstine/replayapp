export class ActiveRefs {
  constructor () {
    this.activeRefs = []
  }

  clear () {
    this.activeRefs = []
  }

  add (ref) {
    if (ref) {
      this.activeRefs.push(ref)
    }
    return ref
  }

  onStreamTimeProgress (streamTime) {
    for (var key in this.activeRefs) {
      this.activeRefs[key].onStreamTimeProgress(streamTime)
    }
  }
}
