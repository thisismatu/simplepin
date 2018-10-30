import {createSwitchNavigator, createStackNavigator, createDrawerNavigator} from 'react-navigation'
import AuthLoadingView from 'app/views/AuthLoadingView'
import LoginView from 'app/views/LoginView'
import PostListView from 'app/views/PostListView'
import MenuView from 'app/views/MenuView'
import SettingsView from 'app/views/SettingsView'
import {colors} from 'app/assets/base'

const headerStyles = {
  headerStyle: {
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
  },
  headerTintColor: colors.gray4,
}

const ListStack = createStackNavigator(
  {
    List: PostListView,
  },
  {
    navigationOptions: headerStyles,
  }
)

const SettingsStack = createStackNavigator(
  {
    Settings: SettingsView,
  },
  {
    navigationOptions: headerStyles,
  }
)

const AppDrawer = createDrawerNavigator(
  {
    List: ListStack,
    Settings: SettingsStack,
  },
  {
    contentComponent: MenuView
  }
)

const AuthStack = createStackNavigator({
  Login: LoginView,
})

const AppNavigator = createSwitchNavigator(
  {
    AuthLoading: AuthLoadingView,
    App: AppDrawer,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  },
)

export default AppNavigator