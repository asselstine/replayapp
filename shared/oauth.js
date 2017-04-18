import OAuthManager from 'react-native-oauth'
import Config from 'react-native-config'
import invariant from 'invariant'
import {Type, String} from 'valib'
const notEmpty = (str) => Type.isString(str) && !String.isEmpty(str) || 'cannot be empty'

const isValid = (prop, str, validations = []) => {
  return validations
          .map(fn => {
            const val = fn(str)
            invariant(typeof val === 'boolean', `${prop} ${val}`)
          })
}

const withDefaultValidations = (validations) => Object.assign({}, {
  callback_url: [notEmpty]
}, validations)

const validate = (customValidations = {}) => (props) => {
  const validations = withDefaultValidations(customValidations)
  return Object.keys(props)
               .map(property => isValid(property, props[property], validations[property]))
}

export const manager = new OAuthManager('replayapp')

manager.addProvider({
  'strava': {
    auth_version: '2.0',
    authorize_url: 'https://www.strava.com/oauth/authorize',
    api_url: 'https://www.strava.com/api',
    callback_url: ({clientId}) => Config.STRAVA_CALLBACK_URL,
    validate: validate({
      client_id: [notEmpty],
      client_secret: [notEmpty]
    })
  }
})
manager.configure({
  strava: {
    client_id: Config.STRAVA_CLIENT_ID,
    client_secret: Config.STRAVA_CLIENT_SECRET,
    access_token_url: 'https://www.strava.com/oauth/token'
  }
})
