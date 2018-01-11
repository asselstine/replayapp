import React, { Dimensions } from 'react-native'

var deviceHeight = Dimensions.get('window').height

export default (size) => {
    if (deviceHeight <= 667) {
        return size
    } else if (deviceHeight < 900) {
        return size * 1.2
    } else {
        return size * 1.8
    }
}
