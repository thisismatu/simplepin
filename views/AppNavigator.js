import {createSwitchNavigator, createStackNavigator} from 'react-navigation'
import AuthLoadingView from 'app/views/AuthLoadingView'
import LoginView from 'app/views/LoginView'
import ListView from 'app/views/ListView'

const AppStack = createStackNavigator({
  List: ListView
})

const AuthStack = createStackNavigator({
  Login: LoginView
})

const AppNavigator = createSwitchNavigator(
  {
    AuthLoading: AuthLoadingView,
    App: AppStack,
    Auth: AuthStack
  },
  {
    initialRouteName: 'AuthLoading',
  }
)

export default AppNavigator