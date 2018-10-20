import React from 'react'
import { StyleSheet, Text, View, TouchableHighlight, TextInput } from 'react-native'
import colors from 'app/assets/colors'
import strings from 'app/assets/strings'

const buttonPressed = () => console.log('button pressed')

export default class WelcomeView extends React.Component {
  static navigationOptions = {
    header: null,
    title: `${strings.login.title}`
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{strings.login.title}</Text>
        <Text style={styles.text}>{strings.login.text}</Text>
        <TextInput
          style={styles.input}
          placeholder={strings.login.placeholder}
          placeholderTextColor = {colors.gray2}
          autoCapitalize='none'
          autoCorrect={false}
          onChangeText={(text) => this.setState({text})}
        />
        <TouchableHighlight
          style={styles.loginButton} onPress={() => console.log('Login')} underlayColor={colors.blue3} activeOpacity={1}>
          <Text style={styles.loginButtonText}>{strings.login.button}</Text>
        </TouchableHighlight>
        <TouchableHighlight style={styles.tokenButton} onPress={() => console.log('Show API token')} underlayColor={colors.gray1} activeOpacity={1}>
          <Text style={styles.text}>{strings.login.token}</Text>
        </TouchableHighlight>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: `${colors.white}`,
    flex: 1,
    justifyContent: 'center',
    padding: 32
  },
  title: {
    color: `${colors.gray4}`,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'center'
  },
  text: {
    color: `${colors.gray3}`,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center'
  },
  input: {
    backgroundColor: `${colors.white}`,
    borderColor: `${colors.gray1}`,
    borderRadius: 4,
    borderWidth: 1,
    color: `${colors.gray4}`,
    fontSize: 15,
    height: 48,
    marginBottom: 24,
    textAlign: 'center',
    width: '100%'
  },
  loginButton: {
    backgroundColor: `${colors.blue2}`,
    borderRadius: 4,
    marginBottom: 24,
    padding: 12,
    width: '100%'
  },
  loginButtonText: {
    color: `${colors.white}`,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  tokenButton: {
    backgroundColor: `${colors.white}`,
    borderRadius: 4,
    padding: 12,
    width: '100%'
  }
})