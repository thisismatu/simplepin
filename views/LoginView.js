import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Clipboard, AppState } from 'react-native'
import PropTypes from 'prop-types'
import lodash from 'lodash/lodash'
import get from 'lodash/get'
import split from 'lodash/isEqual'
import trim from 'lodash/trim'
import Storage from 'app/util/Storage'
import Api from 'app/Api'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

export default class LoginView extends React.Component {
  static navigationOptions = {
    header: null,
    title: Strings.login.title,
  }

  constructor(props) {
    super(props)
    this.state = {
      appState: AppState.currentState,
      apiToken: '',
      clipboardContent: null,
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange)
    this.checkClipboardForApiToken()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.checkClipboardForApiToken()
    }
    this.setState({ appState: nextAppState })
  }

  handleChange = (evt) => {
    this.setState({ apiToken: evt.nativeEvent.text })
  }

  handleSubmit = async () => {
    const response = await Api.login(this.state.apiToken)
    if (response.ok === 0) {
      this.showAlert(response.error)
    } else {
      Storage.setApiToken(this.state.apiToken)
      this.props.navigation.navigate('App')
    }
  }

  checkClipboardForApiToken = async () => {
    const clipboardContent = await Clipboard.getString()
    this.setState({ clipboardContent: trim(clipboardContent) })
    const regex = /[A-Z,0-9]/g
    const tokenLatterPart = lodash(this.state.clipboardContent).split(':').get(['1'])
    if (regex.test(tokenLatterPart) && tokenLatterPart.length === 20) {
      this.setState({ apiToken: this.state.clipboardContent })
    }
  }

  showAlert(error) {
    var errorMessage
    switch (error) {
      case 503:
        errorMessage = Strings.error.unavailable
        break
      default:
        errorMessage = Strings.error.token
    }
    Alert.alert(
      Strings.error.login,
      errorMessage
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{Strings.login.title}</Text>
        <Text style={styles.text}>{Strings.login.text}</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          placeholder={Strings.login.placeholder}
          placeholderTextColor = {Base.colors.gray2}
          returnKeyType="done"
          secureTextEntry={true}
          style={styles.input}
          textContentType="password"
          underlineColorAndroid="transparent"
          value={this.state.apiToken}
          onChange={this.handleChange}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={!this.state.apiToken}
          style={[styles.loginButton, !this.state.apiToken && styles.disabled]}
          onPress={this.handleSubmit}
        >
          <Text style={styles.loginButtonText}>{Strings.login.button}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.tokenButton}
          onPress={() => console.log('Show API token')}
        >
          <Text style={styles.text}>{Strings.login.token}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

LoginView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Base.colors.white,
    flex: 1,
    justifyContent: 'center',
    padding: Base.padding.huge,
  },
  title: {
    color: Base.colors.gray4,
    fontSize: Base.fonts.huge,
    fontWeight: Base.fonts.bold,
    marginBottom: Base.padding.medium,
    textAlign: 'center',
  },
  text: {
    color: Base.colors.gray3,
    fontSize: Base.fonts.medium,
    lineHeight: 24,
    marginBottom: Base.padding.large,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Base.colors.white,
    borderColor: Base.colors.border,
    borderRadius: Base.radius.medium,
    borderWidth: 1,
    color: Base.colors.gray4,
    fontSize: Base.fonts.medium,
    height: 48,
    marginBottom: Base.padding.large,
    textAlign: 'center',
    width: '100%',
  },
  loginButton: {
    backgroundColor: Base.colors.blue2,
    borderRadius: Base.radius.medium,
    marginBottom: Base.padding.large,
    padding: Base.padding.medium,
    width: '100%',
  },
  loginButtonText: {
    color: Base.colors.white,
    fontSize: Base.fonts.medium,
    fontWeight: Base.fonts.bold,
    lineHeight: 16,
    textAlign: 'center',
  },
  tokenButton: {
    backgroundColor: Base.colors.white,
    borderRadius: Base.radius.medium,
    padding: Base.padding.medium,
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
})
