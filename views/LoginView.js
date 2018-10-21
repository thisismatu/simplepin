import React from 'react'
import { StyleSheet, Text, View, TouchableHighlight, TextInput, Alert, AsyncStorage } from 'react-native'
import { login } from 'app/Api';
import colors from 'app/assets/colors'
import strings from 'app/assets/strings'

export default class WelcomeView extends React.Component {
  static navigationOptions = {
    header: null,
    title: `${strings.login.title}`
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
    console.log(error)
    var errorMessage
    switch (error) {
      case 503:
        errorMessage = `${strings.error.unavailable}`
      default:
        errorMessage = `${strings.error.token}`
    }
    Alert.alert(
      `${strings.error.login}`,
      `${errorMessage}`
    )
  }

  handleSubmit = async () => {
    login(this.state.apiToken)
      .then(async (response) => {
        console.log(response)
        if(response.ok == 0) {
          console.log('Login failed')
          this.showAlert(response.error)
        } else {
          console.log('Login succeeded')
          await AsyncStorage.setItem('apiToken', this.state.apiToken)
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
          returnKeyType="done"
          placeholder={strings.login.placeholder}
          placeholderTextColor = {colors.gray2}
          style={styles.input}
          onChange = {this.handleChange}
        />
        <TouchableHighlight
          activeOpacity={1}
          style={styles.loginButton}
          underlayColor={colors.blue3}
          onPress={this.handleSubmit}
        >
          <Text style={styles.loginButtonText}>{strings.login.button}</Text>
        </TouchableHighlight>
        <TouchableHighlight
          activeOpacity={1}
          style={styles.tokenButton}
          underlayColor={colors.gray1}
          onPress={() => console.log('Show API token')}
        >
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