import { Platform, StatusBar } from 'react-native'
import { createAppContainer, createSwitchNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation'
import StackViewStyleInterpolator from 'react-navigation-stack/lib/module/views/StackView/StackViewStyleInterpolator' // eslint-disable-line import/no-extraneous-dependencies
import AddPostView from './views/AddPostView'
import AuthLoadingView from './views/AuthLoadingView'
import BrowserView from './views/BrowserView'
import DrawerView from './views/DrawerView'
import LoginView from './views/LoginView'
import PostsView from './views/PostsView'
import SettingsView from './views/SettingsView'
import { color } from './style/style'
import strings from './style/strings'

const isAndroid = Platform.OS === 'android'

const defaultHeaderStyle = {
  backgroundColor: color.white,
  borderBottomColor: color.black12,
}

const androidHeaderStyle = {
  ...defaultHeaderStyle,
  paddingTop: StatusBar.currentHeight,
  height: StatusBar.currentHeight + 56,
}

const headerStyles = {
  headerStyle: isAndroid ? androidHeaderStyle : defaultHeaderStyle,
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
    defaultNavigationOptions: headerStyles,
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
    defaultNavigationOptions: headerStyles,
  }
)

const AddStack = createStackNavigator(
  {
    Add: AddPostView,
  },
  {
    defaultNavigationOptions: headerStyles,
  }
)

const AppDrawer = createDrawerNavigator(
  {
    MainStack,
  },
  {
    contentComponent: DrawerView,
  }
)

const AppStack = createStackNavigator(
  {
    AppDrawer,
    BrowserStack,
    AddStack,
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

const AppContainer = createAppContainer(AppNavigator)

export default AppContainer
