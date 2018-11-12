import {createSwitchNavigator, createStackNavigator, createDrawerNavigator} from 'react-navigation'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

import AuthLoadingView from 'app/views/AuthLoadingView'
import LoginView from 'app/views/LoginView'
import PostListView from 'app/views/PostListView'
import DrawerView from 'app/views/DrawerView'
import SettingsView from 'app/views/SettingsView'

const headerStyles = {
  headerStyle: {
    backgroundColor: Base.colors.white,
    borderBottomColor: Base.colors.border,
  },
  headerTintColor: Base.colors.gray4,
}

const ListStack = createStackNavigator(
  {
    List: PostListView,
  },
  {
    initialRouteName: 'List',
    initialRouteParams: {title: Strings.list.all},
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
    ListStack: ListStack,
    SettingsStack: SettingsStack,
  },
  {
    contentComponent: DrawerView
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
