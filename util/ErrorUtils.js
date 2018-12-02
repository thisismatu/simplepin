import { Alert } from 'react-native'
import Storage from 'app/util/Storage'
import Strings from 'app/assets/Strings'

const logout = (navigation) => {
  Storage.clear()
  navigation.navigate('AuthLoading')
}

export const handleLoginResponseError = (error) => {
  switch (error) {
    case 401:
    case 500:
      return Alert.alert(
        Strings.error.loginFailed,
        Strings.error.incorrectToken,
      )
    default:
      return Alert.alert(
        Strings.error.somethingWrong,
        Strings.error.tryAgainLater,
      )
  }
}

export const handleResponseError = (error, navigation) => {
  switch (error) {
    case 401:
      return Alert.alert(
        Strings.error.invalidToken,
        Strings.error.logInAgain,
        [{ text: Strings.common.ok, onPress: () => logout(navigation) }],
        { cancelable: false }
      )
    case 429:
      return Alert.alert(
        Strings.error.tooManyRequests,
        Strings.error.tryAgainLater,
      )
    case 500:
    case 503:
      return Alert.alert(
        Strings.error.troubleConnecting,
        Strings.error.pinboardDown,
      )
    default:
      return Alert.alert(
        Strings.error.somethingWrong,
        Strings.error.tryAgainLater,
      )
  }
}
