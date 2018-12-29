import { createSwitchNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation'
import StackViewStyleInterpolator from 'react-navigation-stack/dist/views/StackView/StackViewStyleInterpolator'
import AuthLoadingView from 'app/views/AuthLoadingView'
import LoginView from 'app/views/LoginView'
import PostsView from 'app/views/PostsView'
import BrowserView from 'app/views/BrowserView'
import DrawerView from 'app/views/DrawerView'
import SettingsView from 'app/views/SettingsView'
import AddPostView from 'app/views/AddPostView'
import Base from 'app/style/Base'
import Strings from 'app/style/Strings'

const headerStyles = {
  headerStyle: {
    backgroundColor: Base.color.white,
    borderBottomColor: Base.color.black12,
  },
  headerTintColor: Base.color.blue2,
  headerTitleStyle: { color: Base.color.gray4 },
}

const MainStack = createStackNavigator(
  {
    Posts: PostsView,
    Settings: SettingsView,
  },
  {
    initialRouteName: 'Posts',
    initialRouteParams: { title: Strings.posts.all, list: 'allPosts' },
    navigationOptions: headerStyles,
    transitionConfig: () => ({
      screenInterpolator: (sceneProps) => {
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
    navigationOptions: {
      gesturesEnabled: false,
    },
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
