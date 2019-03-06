import React from 'react'
import { StyleSheet, ScrollView, Platform, Linking } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import PropTypes from 'prop-types'
import { Constants } from 'expo'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'
import omitBy from 'lodash/omitBy'
import Storage from 'app/Storage'
import DrawerHeader from 'app/components/DrawerHeader'
import HeaderCell from 'app/components/HeaderCell'
import DrawerCell from 'app/components/DrawerCell'
import { color, icons, padding } from 'app/style/style'
import strings from 'app/style/strings'

const isAndroid = Platform.OS === 'android'
const storeUrl = isAndroid ? 'https://play.google.com/store' : 'itms://itunes.apple.com/us/app/simplepin/id1107506693'
const feedbackUrl = 'mailto:mathias.lindholm@gmail.com?subject=Simplepin%20Feedback'

export default class DrawerView extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      username: null,
    }
  }

  componentDidMount() {
    Storage.apiToken().then(value => {
      const username = value ? value.split(':')[0] : null
      this.setState({ username: username })
    })
  }

  isRouteFocused = (route, title = null) => {
    const { state } = this.props.navigation
    const index = get(state.routes, ['0', 'index'])
    const focusedRoute = get(state.routes, ['0', 'routes', index, 'routeName'])
    const focusedTitle = get(state.routes, ['0', 'routes', index, 'params', 'title'])
    if (title) {
      return isEqual([route, title],[focusedRoute, focusedTitle])
    }
    return isEqual(route, focusedRoute)
  }

  routeCount = title => {
    const { state } = this.props.navigation
    return get(state.routes, ['0', 'routes', '0', 'params', title])
  }

  navigateTo = (route, title = null, list = null) => () => {
    const params = omitBy({ title: title, list: list }, isEmpty)
    if (this.isRouteFocused(route, title)) {
      return this.props.navigation.closeDrawer()
    }
    this.props.navigation.closeDrawer()
    this.props.navigation.navigate(route, params)
  }

  openUrl = url => {
    Linking.canOpenURL(url).then(() => {
      Linking.openURL(url)
    })
  }

  render() {
    const postsRoute = 'Posts'
    const settingsRoute = 'Settings'
    return (
      <SafeAreaView style={s.safeArea} forceInset={{ bottom: 'never', left: 'always', right: 'never' }}>
        <ScrollView
          bounces={false}
          contentContainerStyle={s.container}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={s.list}
          >
          <DrawerHeader text={this.state.username} />
          <HeaderCell text={strings.posts.title} />
          <DrawerCell
            icon={icons.all}
            title={strings.posts.all}
            count={this.routeCount('allCount')}
            isFocused={this.isRouteFocused(postsRoute, strings.posts.all)}
            onPress={this.navigateTo(postsRoute, strings.posts.all, 'allPosts')}
          />
          <DrawerCell
            icon={icons.unread}
            title={strings.posts.unread}
            count={this.routeCount('unreadCount')}
            isFocused={this.isRouteFocused(postsRoute, strings.posts.unread)}
            onPress={this.navigateTo(postsRoute, strings.posts.unread, 'unreadPosts')}
          />
          <DrawerCell
            icon={icons.starred}
            title={strings.posts.starred}
            count={this.routeCount('starredCount')}
            isFocused={this.isRouteFocused(postsRoute, strings.posts.starred)}
            onPress={this.navigateTo(postsRoute, strings.posts.starred, 'starredPosts')}
          />
          <DrawerCell
            icon={icons.private}
            title={strings.posts.private}
            count={this.routeCount('privateCount')}
            isFocused={this.isRouteFocused(postsRoute, strings.posts.private)}
            onPress={this.navigateTo(postsRoute, strings.posts.private, 'privatePosts')}
          />
          <DrawerCell
            icon={icons.public}
            title={strings.posts.public}
            count={this.routeCount('publicCount')}
            isFocused={this.isRouteFocused(postsRoute, strings.posts.public)}
            onPress={this.navigateTo(postsRoute, strings.posts.public, 'publicPosts')}
          />
          <HeaderCell text={strings.common.simplepin} />
          <DrawerCell
            icon={icons.settings}
            title={strings.settings.title}
            isFocused={this.isRouteFocused(settingsRoute)}
            onPress={this.navigateTo(settingsRoute)}
          />
          <DrawerCell
            icon={icons.message}
            title={strings.common.giveFeedback}
            onPress={() => this.openUrl(feedbackUrl)}
          />
          <DrawerCell
            icon={icons.heart}
            title={strings.common.rateTheApp}
            onPress={() => this.openUrl(storeUrl)}
          />
        </ScrollView>
      </SafeAreaView>
    )
  }
}

DrawerView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: color.white,
  },
  container: {
    marginTop: isAndroid ? Constants.statusBarHeight : 0,
    paddingBottom: padding.medium,
  },
  list: {
    backgroundColor: color.white,
  },
})
