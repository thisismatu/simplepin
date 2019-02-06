import React from 'react'
import { StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native'
import PropTypes from 'prop-types'
import { Constants } from 'expo'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'
import omitBy from 'lodash/omitBy'
import Storage from 'app/util/Storage'
import DrawerHeader from 'app/components/DrawerHeader'
import HeaderCell from 'app/components/HeaderCell'
import DrawerCell from 'app/components/DrawerCell'
import { icons } from 'app/style/style'
import strings from 'app/style/strings'

const isAndroid = Platform.OS === 'android'

export default class DrawerView extends React.PureComponent {
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
    const index = get(state.routes, ['0', 'index'])
    const focusedRoute = get(state.routes, ['0', 'routes', index, 'routeName'])
    const focusedTitle = get(state.routes, ['0', 'routes', index, 'params', 'title'])
    if (title) {
      return isEqual([route, title],[focusedRoute, focusedTitle])
    }
    return isEqual(route, focusedRoute)
  }

  routeCount = (title) => {
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

  render() {
    const postsRoute = 'Posts'
    const settingsRoute = 'Settings'
    return (
      <SafeAreaView style={s.safeArea}>
        <ScrollView
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={s.scrollView}
        >
          <DrawerHeader text={this.state.username} />
          <HeaderCell text={strings.posts.title} />
          <DrawerCell
            icon={icons.all}
            title={strings.posts.all}
            count={this.routeCount('allCount')}
            isFocused={this.isRouteFocused(postsRoute, strings.posts.all)}
            navigateTo={this.navigateTo(postsRoute, strings.posts.all, 'allPosts')}
          />
          <DrawerCell
            icon={icons.unread}
            title={strings.posts.unread}
            count={this.routeCount('unreadCount')}
            isFocused={this.isRouteFocused(postsRoute, strings.posts.unread)}
            navigateTo={this.navigateTo(postsRoute, strings.posts.unread, 'unreadPosts')}
          />
          <DrawerCell
            icon={icons.starred}
            title={strings.posts.starred}
            count={this.routeCount('starredCount')}
            isFocused={this.isRouteFocused(postsRoute, strings.posts.starred)}
            navigateTo={this.navigateTo(postsRoute, strings.posts.starred, 'starredPosts')}
          />
          <DrawerCell
            icon={icons.private}
            title={strings.posts.private}
            count={this.routeCount('privateCount')}
            isFocused={this.isRouteFocused(postsRoute, strings.posts.private)}
            navigateTo={this.navigateTo(postsRoute, strings.posts.private, 'privatePosts')}
          />
          <DrawerCell
            icon={icons.public}
            title={strings.posts.public}
            count={this.routeCount('publicCount')}
            isFocused={this.isRouteFocused(postsRoute, strings.posts.public)}
            navigateTo={this.navigateTo(postsRoute, strings.posts.public, 'publicPosts')}
          />
          <HeaderCell text={strings.common.simplepin} />
          <DrawerCell
            icon={icons.settings}
            title={strings.settings.title}
            isFocused={this.isRouteFocused(settingsRoute)}
            navigateTo={this.navigateTo(settingsRoute)}
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
  },
  scrollView: {
    marginTop: isAndroid ? Constants.statusBarHeight : 0,
  },
})
