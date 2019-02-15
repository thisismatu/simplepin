import React from 'react'
import { StyleSheet, Text, TouchableOpacity, TextInput, Image, Clipboard, AppState, Linking, Dimensions, Animated } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PropTypes from 'prop-types'
import Storage from 'app/util/Storage'
import { handleLoginResponseError } from 'app/util/ErrorUtils'
import Api from 'app/Api'
import { color, padding, font, line, row, radius, icons } from 'app/style/style'
import strings from 'app/style/strings'

const pinboardUrl = 'https://m.pinboard.in/settings/password'
const { height } = Dimensions.get('window')
const smallDevice = height < 640

export default class LoginView extends React.Component {
  static navigationOptions = {
    header: null,
    title: strings.login.title,
  }

  constructor(props) {
    super(props)
    this.spinValue = new Animated.Value(0)
    this.spinAnimation = Animated.loop(
      Animated.timing(this.spinValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    )
    this.iconStyle = StyleSheet.flatten([s.icon, {
      transform: [{
        rotate: this.spinValue.interpolate({
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
    const { apiToken } = this.state
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
    this.spinValue.setValue(0)
    if (loading) {
      this.spinAnimation.start()
    } else {
      this.spinAnimation.stop()
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
        alwaysBounceVertical={false}
        contentContainerStyle={s.container}
        style={s.list}
        >
        <Animated.Image source={icons.simplepin} style={this.iconStyle} />
        <Text style={s.title}>{strings.login.title}</Text>
        <Text style={s.text}>{strings.login.text}</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          placeholder={strings.login.placeholder}
          placeholderTextColor = {color.gray2}
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

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: smallDevice ? padding.large : padding.huge,
    backgroundColor: color.white,
  },
  list: {
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
