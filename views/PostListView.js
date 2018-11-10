import _ from 'lodash'
import React from 'react'
import {StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image, Text} from 'react-native'
import Api from 'app/Api'
import Storage from 'app/util/Storage'
import PostListItem from 'app/views/PostListItem'
import MenuButton from 'app/components/MenuButton'
import {colors} from 'app/assets/base'
import strings from 'app/assets/strings'

const reviver = (key, value) => {
  switch (key) {
    case 'shared':
      return value == 'yes'
    case 'toread':
      return value == 'yes'
    case 'time':
      return new Date(value)
    case 'tags':
      return value !== '' ? value.split(' ') : null
    default:
      return value
  }
}

export default class PostListView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: navigation.getParam('title', strings.menu.all),
      headerLeft: (
        <MenuButton navigation={navigation} />
      )
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      allPosts: null,
      unreadPosts: null,
      privatePosts: null,
      publicPosts: null,
      refreshing: false,
      lastUpdateTime: null,
    }
  }

  componentDidMount() {
    this.onRefresh()
  }

  onRefresh = async () => {
    this.setState({refreshing: true})
    const hasUpdates = await this.checkForUpdates()
    if (hasUpdates) {
      await this.fetchPosts()
    }
    this.setState({refreshing: false})
  }

  checkForUpdates = async () => {
    const apiToken = await Storage.apiToken()
    const response = await Api.update(apiToken)
    if (response.ok == 0) {
      console.warn(response.error)
    } else {
      if (response.update_time !== this.state.lastUpdateTime) {
        this.setState({'lastUpdateTime': response.update_time})
        return true
      }
      return false
    }
  }

  fetchPosts = async () => {
    const apiToken = await Storage.apiToken()
    const response = await Api.mockPosts(apiToken)
    if(response.ok === 0) {
      console.warn(response.error)
    } else {
      const str = JSON.stringify(response)
      const obj = JSON.parse(str, reviver)
      this.setState({
        allPosts: obj,
        unreadPosts: _.filter(obj, ['toread', true]),
        privatePosts: _.filter(obj, ['shared', false]),
        publicPosts: _.filter(obj, ['shared', true]),
      })
      this.props.navigation.setParams({
        allCount: this.state.allPosts.length,
        unreadCount: this.state.unreadPosts.length,
        privateCount: this.state.privatePosts.length,
        publicCount: this.state.publicPosts.length,
      })
    }
  }

  filterPosts = (predicate) => {
    switch (predicate) {
      case strings.menu.unread:
        return this.state.unreadPosts
      case strings.menu.private:
        return this.state.privatePosts
      case strings.menu.public:
        return this.state.publicPosts
      default:
        return this.state.allPosts
    }
  }

  render() {
    const currentList = this.props.navigation.getParam('title', strings.menu.all)
    return (
      <FlatList
        data={this.filterPosts(currentList)}
        initialNumToRender={8}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={null}
        renderItem={({item}) => <PostListItem item={item} />}
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh}
          />
        }
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  }
})