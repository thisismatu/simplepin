import React from 'react'
import { Animated, AppState, Clipboard, Dimensions, Keyboard, Linking, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PropTypes from 'prop-types'
import Api from '../Api'
import Storage from '../Storage'
import { handleLoginResponseError } from '../util/ErrorUtil'
import { color, padding, font, line, row, radius, icons } from '../style/style'
import strings from '../style/strings'

const { height } = Dimensions.get('screen')
const smallDevice = height < 640
const pinboardUrl = 'https://m.pinboard.in/settings/password'

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: smallDevice ? padding.large : padding.huge,
    backgroundColor: color.white,
  },
  icon: {
    tintColor: color.blue2,
    marginBottom: padding.medium,
  },
  title: {
    color: color.gray4,
    fontSize: font.huge,
    fontWeight: font.bold,
    marginBottom: padding.small,
    textAlign: 'center',
  },
  text: {
    color: color.gray3,
    fontSize: font.medium,
    lineHeight: line.medium,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: color.white,
    borderColor: color.black12,
    borderRadius: radius.medium,
    borderWidth: 1,
    color: color.gray4,
    fontSize: font.large,
    height: smallDevice ? 44 : row.medium,
    marginBottom: padding.medium,
    textAlign: 'center',
    width: '100%',
  },
  loginButton: {
    backgroundColor: color.blue2,
    borderRadius: radius.medium,
    marginBottom: padding.medium,
    paddingHorizontal: padding.medium,
    width: '100%',
  },
  loginButtonText: {
    color: color.white,
    fontSize: font.large,
    fontWeight: font.bold,
    lineHeight: smallDevice ? 44 : row.medium,
    textAlign: 'center',
  },
  tokenButton: {
    backgroundColor: color.white,
    paddingHorizontal: padding.medium,
    width: '100%',
  },
  tokenButtonText: {
    color: color.gray3,
    fontSize: font.medium,
    lineHeight: smallDevice ? 44 : row.medium,
    textAlign: 'center',
  },
})

export default class LoginView extends React.Component {
  static navigationOptions = {
    header: null,
    title: strings.login.title,
  }

  constructor(props) {
    super(props)
    this.rotateValue = new Animated.Value(0)
    this.rotateAnimation = Animated.loop(
      Animated.timing(this.rotateValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    )
    this.iconStyle = StyleSheet.flatten([s.icon, {
      transform: [{
        rotate: this.rotateValue.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: ['0deg', '45deg', '315deg', '360deg'],
        }),
      }],
    }])
    this.state = {
      appState: AppState.currentState,
      apiToken: null,
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this.onAppStateChange)
    this.checkClipboardForApiToken()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.onAppStateChange)
  }

  onAppStateChange = nextAppState => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.checkClipboardForApiToken()
    }
    this.setState({ appState: nextAppState })
  }

  onChange = evt => {
    this.setState({ apiToken: evt.nativeEvent.text })
  }

  onSubmit = async () => {
    const { apiToken } = this.state
    Keyboard.dismiss()
    this.animate(true)
    const response = await Api.userToken(apiToken)
    if (response.ok === 0) {
      this.animate(false)
      handleLoginResponseError(response.error)
    } else {
      this.animate(false)
      Storage.setApiToken(apiToken)
      this.props.navigation.navigate('App')
    }
  }

  onShowToken = () => {
    Linking.canOpenURL(pinboardUrl).then(() => {
      Linking.openURL(pinboardUrl)
    })
  }

  animate = loading => {
    this.rotateValue.setValue(0)
    if (loading) {
      this.rotateAnimation.start()
    } else {
      this.rotateAnimation.stop()
    }
  }

  checkClipboardForApiToken = async () => {
    const clipboardContent = await Clipboard.getString()
    const regex = /[A-Z,0-9]/g
    const tokenLatterPart = clipboardContent.trim().split(':')[1]
    if (regex.test(tokenLatterPart) && tokenLatterPart.length === 20) {
      this.setState({ apiToken: clipboardContent.trim() })
    }
  }

  render() {
    const { apiToken } = this.state
    return (
      <KeyboardAwareScrollView
        extraHeight={smallDevice ? 80 : 140}
        alwaysBounceVertical={false}
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.Image source={icons.simplepin} style={this.iconStyle} />
        <Text style={s.title}>{strings.login.title}</Text>
        <Text style={s.text}>{strings.login.text}</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          placeholder={strings.login.placeholder}
          placeholderTextColor={color.gray2}
          returnKeyType="done"
          secureTextEntry={true}
          style={s.input}
          textContentType="password"
          underlineColorAndroid="transparent"
          value={apiToken}
          onChange={this.onChange}
          onSubmitEditing={this.onSubmit}
        />
        <TouchableOpacity
          activeOpacity={0.5}
          style={s.loginButton}
          onPress={this.onSubmit}
        >
          <Text style={s.loginButtonText}>{strings.login.button}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          style={s.tokenButton}
          onPress={this.onShowToken}
        >
          <Text style={s.tokenButtonText}>{strings.login.token}</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    )
  }
}

LoginView.propTypes = {
  navigation: PropTypes.object.isRequired,
}
