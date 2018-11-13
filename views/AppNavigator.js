import { createSwitchNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation'
import AuthLoadingView from 'app/views/AuthLoadingView'
import LoginView from 'app/views/LoginView'
import PostsView from 'app/views/PostsView'
import BrowserView from 'app/views/BrowserView'
import DrawerView from 'app/views/DrawerView'
import SettingsView from 'app/views/SettingsView'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

const headerStyles = {
  headerStyle: {
    backgroundColor: Base.color.white,
    borderBottomColor: Base.color.border,
  },
  headerTintColor: Base.color.blue2,
  headerTitleStyle: { color: Base.color.gray4 },
}

const PostsStack = createStackNavigator(
  {
    Posts: PostsView,
    Browser: BrowserView,
  },
  {
    initialRouteName: 'Posts',
    initialRouteParams: { title: Strings.posts.all },
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
    PostsStack: PostsStack,
    SettingsStack: SettingsStack,
  },
  {
    contentComponent: DrawerView,
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
