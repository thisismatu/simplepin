import { createSwitchNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation'
import StackViewStyleInterpolator from 'react-navigation-stack/dist/views/StackView/StackViewStyleInterpolator'
import AddPostView from './views/AddPostView'
import AuthLoadingView from './views/AuthLoadingView'
import BrowserView from './views/BrowserView'
import DrawerView from './views/DrawerView'
import LoginView from './views/LoginView'
import PostsView from './views/PostsView'
import SettingsView from './views/SettingsView'
import { color } from './style/style'
import strings from './style/strings'

const headerStyles = {
  headerStyle: {
    backgroundColor: color.white,
    borderBottomColor: color.black12,
  },
  headerTintColor: color.blue2,
  headerTitleStyle: { color: color.gray4 },
}

const MainStack = createStackNavigator(
  {
    Posts: PostsView,
    Settings: SettingsView,
  },
  {
    initialRouteName: 'Posts',
    initialRouteParams: { title: strings.posts.all, list: 'allPosts' },
    navigationOptions: headerStyles,
    transitionConfig: () => ({
      screenInterpolator: sceneProps => {
        return StackViewStyleInterpolator.forFade(sceneProps)
      },
    }),
  }
)

const BrowserStack = createStackNavigator(
  {
    Browser: BrowserView,
  },
  {
    navigationOptions: headerStyles,
  }
)

const AddStack = createStackNavigator(
  {
    Add: AddPostView,
  },
  {
    navigationOptions: headerStyles,
  }
)

const AppDrawer = createDrawerNavigator(
  {
    MainStack: MainStack,
  },
  {
    contentComponent: DrawerView,
  }
)

const AppStack = createStackNavigator(
  {
    AppDrawer: AppDrawer,
    BrowserStack: BrowserStack,
    AddStack: AddStack,
  },
  {
    mode: 'modal',
    headerMode: 'none',
  }
)

const AuthStack = createStackNavigator(
  {
    Login: LoginView,
  }
)

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
