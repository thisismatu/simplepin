import React from 'react'
import { createStackNavigator } from 'react-navigation'
import LoginView from 'app/views/LoginView'

const AppNavigator = createStackNavigator(
  {
    Login: { screen: LoginView }
  }
)

export default AppNavigator