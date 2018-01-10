import dpiNormalize from '../dpi-normalize'

export default {
  header: {
    fontSize: dpiNormalize(24),
    textAlign: 'center'
  },

  content: {
    padding: dpiNormalize(20),
  },

  header: {
    textAlign: 'left',
    fontSize: dpiNormalize(32),
    fontWeight: '600',
  },

  headerBox: {
    paddingTop: dpiNormalize(20),
    paddingBottom: dpiNormalize(20),
  },

  flexCol: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },

  inline: {
    flexDirection: 'row'
  },

  spread: {
    justifyContent: 'space-between'
  },

  block: {
    paddingTop: dpiNormalize(10),
    paddingBottom: dpiNormalize(10),
  },

  explain: {
    fontSize: dpiNormalize(20),
    fontWeight: '300',
  },

  explainBold: {
    fontSize: dpiNormalize(20),
    fontWeight: '700',
  },
}
