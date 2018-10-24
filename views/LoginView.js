import React from 'react'
import {StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, AsyncStorage} from 'react-native'
import Storage from 'app/util/Storage'
import {login} from 'app/Api'
import {colors, fonts, padding, radius} from 'app/assets/base'
import strings from 'app/assets/strings'

export default class LoginView extends React.Component {
  static navigationOptions = {
    header: null,
    title: strings.login.title
  }

  constructor(props) {
    super(props)
    this.state = {apiToken: ''}
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(e) {
    this.setState({
      apiToken: e.nativeEvent.text
    })
  }

  showAlert(error) {
    var errorMessage
    switch (error) {
      case 503:
        errorMessage = strings.error.unavailable
      default:
        errorMessage = strings.error.token
    }
    Alert.alert(
      strings.error.login,
      errorMessage
    )
  }

  handleSubmit = () => {
    login(this.state.apiToken)
      .then((response) => {
        console.log(response)
        if (response.ok === 0) {
          this.showAlert(response.error)
        } else {
          Storage.setApiToken(this.state.apiToken)
          this.props.navigation.navigate('App')
        }
      })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{strings.login.title}</Text>
        <Text style={styles.text}>{strings.login.text}</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          placeholder={strings.login.placeholder}
          placeholderTextColor = {colors.gray2}
          returnKeyType="done"
          style={styles.input}
          textContentType="password"
          secureTextEntry={true}
          underlineColorAndroid="transparent"
          onChange = {this.handleChange}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={!this.state.apiToken}
          style={[styles.loginButton, !this.state.apiToken && styles.disabled]}
          onPress={this.handleSubmit}
        >
          <Text style={styles.loginButtonText}>{strings.login.button}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.tokenButton}
          onPress={() => console.log('Show API token')}
        >
          <Text style={styles.text}>{strings.login.token}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: 'center',
    padding: padding.huge,
  },
  title: {
    color: colors.gray4,
    fontSize: fonts.huge,
    fontWeight: fonts.bold,
    marginBottom: padding.medium,
    textAlign: 'center',
  },
  text: {
    color: colors.gray3,
    fontSize: fonts.medium,
    lineHeight: 24,
    marginBottom: padding.large,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    color: colors.gray4,
    fontSize: fonts.medium,
    height: 48,
    marginBottom: padding.large,
    textAlign: 'center',
    width: '100%',
  },
  loginButton: {
    backgroundColor: colors.blue2,
    borderRadius: radius.medium,
    marginBottom: padding.large,
    padding: padding.medium,
    width: '100%',
  },
  loginButtonText: {
    color: colors.white,
    fontSize: fonts.medium,
    fontWeight: fonts.bold,
    lineHeight: 16,
    textAlign: 'center',
  },
  tokenButton: {
    backgroundColor: colors.white,
    borderRadius: radius.medium,
    padding: padding.medium,
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
})