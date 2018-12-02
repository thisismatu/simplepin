import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Clipboard, AppState, ActivityIndicator } from 'react-native'
import PropTypes from 'prop-types'
import Storage from 'app/util/Storage'
import { handleLoginResponseError } from 'app/util/ErrorUtils'
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
      loading: false,
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this.onAppStateChange)
    this.checkClipboardForApiToken()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.onAppStateChange)
  }

  onAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.checkClipboardForApiToken()
    }
    this.setState({ appState: nextAppState })
  }

  onChange = (evt) => {
    this.setState({ apiToken: evt.nativeEvent.text })
  }

  onSubmit = async () => {
    this.setState({ loading: true })
    const response = await Api.login(this.state.apiToken)
    if (response.ok === 0) {
      this.setState({ loading: false })
      handleLoginResponseError(response.error)
    } else {
      this.setState({ loading: false })
      Storage.setApiToken(this.state.apiToken)
      this.props.navigation.navigate('App')
    }
  }

  checkClipboardForApiToken = async () => {
    const clipboardContent = await Clipboard.getString()
    this.setState({ clipboardContent: clipboardContent.trim() })
    const regex = /[A-Z,0-9]/g
    const tokenLatterPart = this.state.clipboardContent.split(':')[1]
    if (regex.test(tokenLatterPart) && tokenLatterPart.length === 20) {
      this.setState({ apiToken: this.state.clipboardContent })
    }
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
          placeholderTextColor = {Base.color.gray2}
          returnKeyType="done"
          secureTextEntry={true}
          style={styles.input}
          textContentType="password"
          underlineColorAndroid="transparent"
          value={this.state.apiToken}
          onChange={this.onChange}
        />
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={!this.state.apiToken}
          style={[styles.loginButton, !this.state.apiToken && styles.disabled]}
          onPress={this.onSubmit}
        >
          <Text style={styles.loginButtonText}>{Strings.login.button}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.tokenButton}
          onPress={() => console.log('Show API token')}
        >
          <Text style={styles.text}>{Strings.login.token}</Text>
        </TouchableOpacity>
        <ActivityIndicator style={{ opacity: this.state.loading ? 1 : 0 }} />
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
    backgroundColor: Base.color.white,
    flex: 1,
    justifyContent: 'center',
    padding: Base.padding.huge,
  },
  title: {
    color: Base.color.gray4,
    fontSize: Base.font.huge,
    fontWeight: Base.font.bold,
    marginBottom: Base.padding.medium,
    textAlign: 'center',
  },
  text: {
    color: Base.color.gray3,
    fontSize: Base.font.medium,
    lineHeight: Base.line.medium,
    marginBottom: Base.padding.large,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Base.color.white,
    borderColor: Base.color.border,
    borderRadius: Base.radius.medium,
    borderWidth: 1,
    color: Base.color.gray4,
    fontSize: Base.font.medium,
    height: Base.row.medium,
    marginBottom: Base.padding.large,
    textAlign: 'center',
    width: '100%',
  },
  loginButton: {
    backgroundColor: Base.color.blue2,
    borderRadius: Base.radius.medium,
    marginBottom: Base.padding.large,
    padding: Base.padding.medium,
    width: '100%',
  },
  loginButtonText: {
    color: Base.color.white,
    fontSize: Base.font.medium,
    fontWeight: Base.font.bold,
    lineHeight: Base.line.small,
    textAlign: 'center',
  },
  tokenButton: {
    backgroundColor: Base.color.white,
    borderRadius: Base.radius.medium,
    padding: Base.padding.medium,
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
})
