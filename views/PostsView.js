import React from 'react'
import { StyleSheet, FlatList, RefreshControl } from 'react-native'
import split from 'lodash/split'
import filter from 'lodash/filter'
import isEqual from 'lodash/isEqual'
import merge from 'lodash/merge'
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
    case 'extended':
      return value.trim()
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
      markAsRead: false,
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(this.state, prevState)) {
      Storage.markAsRead().then((value) => {
        this.setState({ markAsRead: !!value })
      })
    }
  }

  componentDidMount() {
    this.onRefresh()
  }

  onRefresh = async () => {
    this.setState({ refreshing: true })
    const hasUpdates = await this.checkForUpdates()
    if (hasUpdates) {
      await this.fetchPosts()
    }
    this.setState({ refreshing: false })
  }

  checkForUpdates = async () => {
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

  fetchPosts = async () => {
    const apiToken = await Storage.apiToken()
    const response = await Api.postsAll(apiToken)
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

  cellHandler = (post) => {
    this.props.navigation.navigate('Browser', { title: post.description, url: post.href })
    this.shouldUpdatePost(post)
  }

  shouldUpdatePost(post) {
    if (this.state.markAsRead && post.toread) {
      post.toread = !post.toread
      const mergeCollection = merge(this.state.allPosts, post)
      this.setState({
        allPosts: mergeCollection,
        unreadPosts: filter(mergeCollection, ['toread', true]),
        privatePosts: filter(mergeCollection, ['shared', false]),
        publicPosts: filter(mergeCollection, ['shared', true]),
      })
      this.updatePost(post)
    }
  }

  updatePost = async (post) => {
    const apiToken = await Storage.apiToken()
    const response = await Api.postsAdd(post, apiToken)
    if(response.ok === 0) {
      console.warn(response.error)
    } else {
      const str = JSON.stringify(response)
      console.log(str)
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
        ItemSeparatorComponent={() => <Separator left={Base.padding.large} />}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={null}
        renderItem={({ item }) =>
          <PostCell
            post={item}
            cellHandler={this.cellHandler}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh}
          />
        }
        style={styles.container}
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
