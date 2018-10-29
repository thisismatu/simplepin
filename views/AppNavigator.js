import {createSwitchNavigator, createStackNavigator} from 'react-navigation'
import AuthLoadingView from 'app/views/AuthLoadingView'
import LoginView from 'app/views/LoginView'
import PostListView from 'app/views/PostListView'
import MenuView from 'app/views/MenuView'
import {colors} from 'app/assets/base'

const headerStyles = {
  headerStyle: {
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
  },
  headerTintColor: '#111',
}

const MainStack = createStackNavigator(
  {
    List: PostListView
  },
  {
    navigationOptions: headerStyles,
  }
)

const MenuStack = createStackNavigator(
  {
    Menu: MenuView
  },
  {
    navigationOptions: headerStyles,
  }
)

const AppStack = createStackNavigator(
  {
    Main: MainStack,
    Menu: MenuStack,
  },
  {
    headerMode: 'none',
    mode: 'modal',
  }
)

const AuthStack = createStackNavigator({
  Login: LoginView,
})

const AppNavigator = createSwitchNavigator(
  {
    AuthLoading: AuthLoadingView,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  },
)

export default AppNavigator