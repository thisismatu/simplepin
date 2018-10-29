import {createSwitchNavigator, createStackNavigator} from 'react-navigation'
import {colors} from 'app/assets/base'
import AuthLoadingView from 'app/views/AuthLoadingView'
import LoginView from 'app/views/LoginView'
import PostListView from 'app/views/PostListView'
import MenuView from 'app/views/MenuView'

const headerStyles = {
  headerStyle: {
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
  },
  headerTintColor: '#111',
}

const AppStack = createStackNavigator(
  {
    List: PostListView,
    Menu: MenuView,
  },
  {
    navigationOptions: headerStyles,
  },
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