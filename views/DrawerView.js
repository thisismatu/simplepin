import React from 'react'
import { StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native'
import PropTypes from 'prop-types'
import { Constants } from 'expo'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import HeaderCell from 'app/components/HeaderCell'
import DrawerCell from 'app/components/DrawerCell'
import Strings from 'app/assets/Strings'

export default class DrawerView extends React.Component {
  isRouteFocused = (route, param = null) => {
    const { state } = this.props.navigation
    const focusedRoute = get(state.routes[state.index], ['routes', '0', 'routeName'])
    const focusedParam = get(state.routes[state.index], ['routes', '0', 'params', 'title'])
    if (param) {
      return isEqual([route, param],[focusedRoute, focusedParam])
    }
    return isEqual(route, focusedRoute)
  }

  routeCount = (param) => {
    const { state } = this.props.navigation
    return get(state.routes, ['0', 'routes', '0', 'params', param])
  }

  navigateTo = (route, title, list = null, isFocused) => () => {
    if (isFocused) {
      return this.props.navigation.closeDrawer()
    }
    this.props.navigation.closeDrawer()
    this.props.navigation.navigate(route, { title: title, list: list })
  }

  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <HeaderCell text={Strings.posts.title} />
          <DrawerCell
            route="Posts"
            title={Strings.posts.all}
            count="allCount"
            list="allPosts"
            routeCount={this.routeCount}
            isFocused={this.isRouteFocused}
            navigateTo={this.navigateTo}
          />
          <DrawerCell
            route="Posts"
            title={Strings.posts.unread}
            count="unreadCount"
            list="unreadPosts"
            routeCount={this.routeCount}
            isFocused={this.isRouteFocused}
            navigateTo={this.navigateTo}
          />
          <DrawerCell
            route="Posts"
            title={Strings.posts.private}
            count="privateCount"
            list="privatePosts"
            routeCount={this.routeCount}
            isFocused={this.isRouteFocused}
            navigateTo={this.navigateTo}
          />
          <DrawerCell
            route="Posts"
            title={Strings.posts.public}
            count="publicCount"
            list="publicPosts"
            routeCount={this.routeCount}
            isFocused={this.isRouteFocused}
            navigateTo={this.navigateTo}
          />

          <HeaderCell text={Strings.common.simplepin} />
          <DrawerCell
            route="Settings"
            title={Strings.settings.title}
            isFocused={this.isRouteFocused}
            navigateTo={this.navigateTo}
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
    marginTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  },
})
