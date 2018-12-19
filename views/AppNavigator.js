import { createSwitchNavigator, createStackNavigator, createDrawerNavigator } from 'react-navigation'
import AuthLoadingView from 'app/views/AuthLoadingView'
import LoginView from 'app/views/LoginView'
import PostsView from 'app/views/PostsView'
import BrowserView from 'app/views/BrowserView'
import DrawerView from 'app/views/DrawerView'
import SettingsView from 'app/views/SettingsView'
import EditPostView from 'app/views/EditPostView'
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

const PostsStack = createStackNavigator(
  {
    Posts: PostsView,
  },
  {
    initialRouteName: 'Posts',
    initialRouteParams: { title: Strings.posts.all, list: 'allPosts' },
    navigationOptions: headerStyles,
  }
)

const ModalStack = createStackNavigator(
  {
    Browser: BrowserView,
  },
  {
    navigationOptions: headerStyles,
  }
)

const EditStack = createStackNavigator(
  {
    Edit: EditPostView,
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
    PostsStack: PostsStack,
    SettingsStack: SettingsStack,
  },
  {
    contentComponent: DrawerView,
  }
)

const AppStack = createStackNavigator(
  {
    Drawer: AppDrawer,
    ModalStack: ModalStack,
    EditStack: EditStack,
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
