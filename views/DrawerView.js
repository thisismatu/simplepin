import React from 'react'
import { StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native'
import PropTypes from 'prop-types'
import { Constants } from 'expo'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import Storage from 'app/util/Storage'
import DrawerHeader from 'app/components/DrawerHeader'
import HeaderCell from 'app/components/HeaderCell'
import DrawerCell from 'app/components/DrawerCell'
import Strings from 'app/style/Strings'
import Icons from 'app/style/Icons'

const isAndroid = Platform.OS === 'android'

export default class DrawerView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: null,
    }
  }

  componentDidMount() {
    Storage.apiToken().then((value) => {
      const username = value ? value.split(':')[0] : null
      this.setState({ username: username })
    })
  }

  isRouteFocused = (route, title = null) => {
    const { state } = this.props.navigation
    const focusedRoute = get(state.routes[state.index], ['routes', '0', 'routeName'])
    const focusedTitle = get(state.routes[state.index], ['routes', '0', 'params', 'title'])
    if (title) {
      return isEqual([route, title],[focusedRoute, focusedTitle])
    }
    return isEqual(route, focusedRoute)
  }

  routeCount = (title) => {
    const { state } = this.props.navigation
    return get(state.routes, ['0', 'routes', '0', 'params', title])
  }

  navigateTo = (route, title, list = null) => () => {
    if (this.isRouteFocused(route,title)) {
      return this.props.navigation.closeDrawer()
    }
    this.props.navigation.closeDrawer()
    this.props.navigation.navigate(route, { title: title, list: list })
  }

  render() {
    const postsRoute = 'Posts'
    const settingsRoute = 'Settings'
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <DrawerHeader text={this.state.username} />
          <HeaderCell text={Strings.posts.title} />
          <DrawerCell
            route={postsRoute}
            icon={Icons.all}
            title={Strings.posts.all}
            count={this.routeCount('allCount')}
            isFocused={this.isRouteFocused(postsRoute, Strings.posts.all)}
            navigateTo={this.navigateTo(postsRoute, Strings.posts.all, 'allPosts')}
          />
          <DrawerCell
            route={postsRoute}
            icon={Icons.unread}
            title={Strings.posts.unread}
            count={this.routeCount('unreadCount')}
            isFocused={this.isRouteFocused(postsRoute, Strings.posts.unread)}
            navigateTo={this.navigateTo(postsRoute, Strings.posts.unread, 'unreadPosts')}
          />
          <DrawerCell
            route={postsRoute}
            icon={Icons.private}
            title={Strings.posts.private}
            count={this.routeCount('privateCount')}
            isFocused={this.isRouteFocused(postsRoute, Strings.posts.private)}
            navigateTo={this.navigateTo(postsRoute, Strings.posts.private, 'privatePosts')}
          />
          <DrawerCell
            route={postsRoute}
            icon={Icons.public}
            title={Strings.posts.public}
            count={this.routeCount('publicCount')}
            isFocused={this.isRouteFocused(postsRoute, Strings.posts.public)}
            navigateTo={this.navigateTo(postsRoute, Strings.posts.public, 'publicPosts')}
          />

          <HeaderCell text={Strings.common.simplepin} />
          <DrawerCell
            route={settingsRoute}
            icon={Icons.settings}
            title={Strings.settings.title}
            isFocused={this.isRouteFocused(settingsRoute, Strings.settings.title)}
            navigateTo={this.navigateTo(settingsRoute, Strings.settings.title)}
          />
        </ScrollView>
      </SafeAreaView>
    )
  }
}

DrawerView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    marginTop: isAndroid ? Constants.statusBarHeight : 0,
  },
})
