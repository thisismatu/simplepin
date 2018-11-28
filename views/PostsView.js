import React from 'react'
import { StyleSheet, FlatList, RefreshControl, View } from 'react-native'
import filter from 'lodash/filter'
import isEqual from 'lodash/isEqual'
import merge from 'lodash/merge'
import PropTypes from 'prop-types'
import Api from 'app/Api'
import Storage from 'app/util/Storage'
import { reviver } from 'app/util/JsonUtils'
import MenuButton from 'app/components/MenuButton'
import PostCell from 'app/components/PostCell'
import Separator from 'app/components/Separator'
import PostModal from 'app/components/PostModal'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

const filteredPosts = (obj) => {
  return {
    allPosts: obj,
    unreadPosts: filter(obj, ['toread', true]),
    privatePosts: filter(obj, ['shared', false]),
    publicPosts: filter(obj, ['shared', true]),
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
      modalVisible: false,
      selectedPost: {},
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
      const newState = filteredPosts(obj)
      this.setState(newState)
      this.props.navigation.setParams({
        allCount: this.state.allPosts.length,
        unreadCount: this.state.unreadPosts.length,
        privateCount: this.state.privatePosts.length,
        publicCount: this.state.publicPosts.length,
      })
    }
  }

  onRefresh = async () => {
    this.setState({ refreshing: true })
    const hasUpdates = await this.checkForUpdates()
    if (hasUpdates) {
      await this.fetchPosts()
    }
    this.setState({ refreshing: false })
  }

  updatePost = async (post) => {
    post.toread = !post.toread
    const mergeCollection = merge(this.state.allPosts, post)
    const newState = filteredPosts(mergeCollection)
    this.setState(newState)
    const apiToken = await Storage.apiToken()
    Api.postsAdd(post, apiToken)
  }

  onCellPress = post => () => {
    this.props.navigation.navigate('Browser', { title: post.description, url: post.href })
    if (this.state.markAsRead && post.toread) {
      this.updatePost(post)
    }
  }

  onCellLongPress = post => () => {
    this.setState({
      modalVisible: true,
      selectedPost: post,
    })
  }

  onModalClose = () => {
    this.setState({
      modalVisible: false,
      selectedPost: {},
    })
  }

  currentList(predicate) {
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
    const titleParam = this.props.navigation.getParam('title', Strings.posts.all)
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={this.currentList(titleParam)}
          initialNumToRender={8}
          ItemSeparatorComponent={() => <Separator left={Base.padding.large} />}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={null}
          renderItem={({ item }) =>
            <PostCell
              post={item}
              onCellPress={this.onCellPress}
              onCellLongPress={this.onCellLongPress}
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
        <PostModal
          modalVisible={this.state.modalVisible}
          onClose={this.onModalClose}
          post={this.state.selectedPost}
        />
      </View>
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
  }
})
