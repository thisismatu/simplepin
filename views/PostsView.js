import React from 'react'
import { StyleSheet, FlatList, RefreshControl } from 'react-native'
import split from 'lodash/split'
import filter from 'lodash/filter'
import PropTypes from 'prop-types'
import Api from 'app/Api'
import Storage from 'app/util/Storage'
import MenuButton from 'app/components/MenuButton'
import PostCell from 'app/components/PostCell'
import Separator from 'app/components/Separator'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

const reviver = (key, value) => {
  switch (key) {
    case 'shared':
      return value === 'yes'
    case 'toread':
      return value === 'yes'
    case 'time':
      return new Date(value)
    case 'tags':
      return value !== '' ? split(value, ' ') : null
    default:
      return value
  }
}

export default class PostsView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', Strings.posts.all),
      headerLeft: <MenuButton navigation={navigation} />,
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

  async onRefresh() {
    this.setState({ refreshing: true })
    const hasUpdates = await this.checkForUpdates()
    if (hasUpdates) {
      await this.fetchPosts()
    }
    this.setState({ refreshing: false })
  }

  async checkForUpdates() {
    const apiToken = await Storage.apiToken()
    const response = await Api.update(apiToken)
    if (response.ok === 0) {
      console.warn(response.error)
    } else if (response.update_time !== this.state.lastUpdateTime) {
      this.setState({ lastUpdateTime: response.update_time })
      return true
    }
    return false
  }

  async fetchPosts() {
    const apiToken = await Storage.apiToken()
    const response = await Api.mockPosts(apiToken)
    if(response.ok === 0) {
      console.warn(response.error)
    } else {
      const str = JSON.stringify(response)
      const obj = JSON.parse(str, reviver)
      this.setState({
        allPosts: obj,
        unreadPosts: filter(obj, ['toread', true]),
        privatePosts: filter(obj, ['shared', false]),
        publicPosts: filter(obj, ['shared', true]),
      })
      this.props.navigation.setParams({
        allCount: this.state.allPosts.length,
        unreadCount: this.state.unreadPosts.length,
        privateCount: this.state.privatePosts.length,
        publicCount: this.state.publicPosts.length,
      })
    }
  }

  filterPosts(predicate) {
    switch (predicate) {
      case Strings.posts.unread:
        return this.state.unreadPosts
      case Strings.posts.private:
        return this.state.privatePosts
      case Strings.posts.public:
        return this.state.publicPosts
      default:
        return this.state.allPosts
    }
  }

  render() {
    const currentList = this.props.navigation.getParam('title', Strings.posts.all)
    return (
      <FlatList
        data={this.filterPosts(currentList)}
        initialNumToRender={8}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={null}
        ItemSeparatorComponent={() => <Separator left={Base.padding.large} />}
        renderItem={({ item }) => <PostCell item={item} navigation={this.props.navigation} />}
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

PostsView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Base.color.white,
    paddingVertical: Base.padding.tiny,
  },
})
