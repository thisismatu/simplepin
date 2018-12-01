import React from 'react'
import { StyleSheet, FlatList, RefreshControl, View, Alert } from 'react-native'
import filter from 'lodash/filter'
import isEqual from 'lodash/isEqual'
import merge from 'lodash/merge'
import reject from 'lodash/reject'
import PropTypes from 'prop-types'
import Api from 'app/Api'
import Storage from 'app/util/Storage'
import { reviver } from 'app/util/JsonUtils'
import MenuButton from 'app/components/MenuButton'
import PostCell from 'app/components/PostCell'
import Separator from 'app/components/Separator'
import BottomSheet from 'app/components/BottomSheet'
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

const filteredPostsCount = (obj) => {
  return {
    allCount: obj.allPosts.length,
    unreadCount: obj.unreadPosts.length,
    privateCount: obj.privatePosts.length,
    publicCount: obj.publicPosts.length,
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
      exactDate: false,
      tagOrder: false,
      modalVisible: false,
      selectedPost: {},
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(this.state, prevState)) {
      Storage.markAsRead().then((value) => {
        this.setState({ markAsRead: !!value })
      })
      Storage.exactDate().then((value) => {
        this.setState({ exactDate: !!value })
      })
      Storage.tagOrder().then((value) => {
        this.setState({ tagOrder: !!value })
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
      const newStateCount = filteredPostsCount(newState)
      this.setState(newState)
      this.props.navigation.setParams(newStateCount)
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
    const newStateCount = filteredPostsCount(newState)
    this.setState(newState)
    this.props.navigation.setParams(newStateCount)
    const apiToken = await Storage.apiToken()
    Api.postsAdd(post, apiToken)
  }

  deletePost = async (post) => {
    const newCollection = reject(this.state.allPosts, { href: post.href })
    const newState = filteredPosts(newCollection)
    const newStateCount = filteredPostsCount(newState)
    this.setState(newState)
    this.props.navigation.setParams(newStateCount)
    const apiToken = await Storage.apiToken()
    Api.postsDelete(post, apiToken)
  }

  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
  }

  onCellPress = post => () => {
    this.props.navigation.navigate('Browser', { title: post.description, url: post.href })
    if (this.state.markAsRead && post.toread) {
      this.updatePost(post)
    }
  }

  onCellLongPress = post => () => {
    this.toggleModal()
    this.setState({ selectedPost: post })
  }

  onToggleToread = post => () => {
    this.toggleModal()
    this.updatePost(post)
  }

  onEditPost = post => () => {
    console.log('TODO: edit post view \n', post)
  }

  onDeletePost = post => () => {
    Alert.alert(
      Strings.common.deletePost,
      post.description,
      [
        { text: Strings.common.cancel, style: 'cancel' },
        { text: Strings.common.delete,
          onPress: () => {
            this.toggleModal()
            this.deletePost(post)
          },
          style: 'destructive',
        },
      ]
    )
  }

  render() {
    const currentList = this.props.navigation.getParam('list', 'allPosts')
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={this.state[currentList]}
          initialNumToRender={8}
          ItemSeparatorComponent={() => <Separator left={Base.padding.large} />}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={null}
          renderItem={({ item }) =>
            <PostCell
              post={item}
              onCellPress={this.onCellPress}
              onCellLongPress={this.onCellLongPress}
              exactDate={this.state.exactDate}
              tagOrder={this.state.tagOrder}
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
        <BottomSheet
          modalVisible={this.state.modalVisible}
          onClose={this.toggleModal}
          onToggleToread={this.onToggleToread}
          onEditPost={this.onEditPost}
          onDeletePost={this.onDeletePost}
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
  },
})
