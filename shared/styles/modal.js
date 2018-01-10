import dpiNormalize from '../dpi-normalize'

export default {
  header: {

  },

  title: {
    fontSize: dpiNormalize(28),
    fontWeight: '200',
    marginTop: dpiNormalize(30),
    paddingBottom: dpiNormalize(10),
    textAlign: 'center',
  },

  body: {
    flex: 1,
    padding: dpiNormalize(10)
  },

  footer: {
    paddingBottom: dpiNormalize(10)
  },
}
