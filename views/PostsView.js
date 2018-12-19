import React from 'react'
import { StyleSheet, FlatList, RefreshControl, View, Alert } from 'react-native'
import PropTypes from 'prop-types'
import filter from 'lodash/filter'
import merge from 'lodash/merge'
import reject from 'lodash/reject'
import map from 'lodash/map'
import intersection from 'lodash/intersection'
import Api from 'app/Api'
import Storage from 'app/util/Storage'
import { reviver } from 'app/util/JsonUtils'
import { handleResponseError } from 'app/util/ErrorUtils'
import NavigationButton from 'app/components/NavigationButton'
import PostCell from 'app/components/PostCell'
import Separator from 'app/components/Separator'
import BottomSheet from 'app/components/BottomSheet'
import SearchBar from 'app/components/SearchBar'
import EmptyState from 'app/components/EmptyState'
import Base from 'app/style/Base'
import Strings from 'app/style/Strings'
import Icons from 'app/style/Icons'

const filterPosts = (obj) => {
  return {
    allPosts: obj,
    unreadPosts: filter(obj, ['toread', true]),
    privatePosts: filter(obj, ['shared', false]),
    publicPosts: filter(obj, ['shared', true]),
  }
}

const postsCount = (obj) => {
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
      headerLeft: <NavigationButton onPress={() => navigation.openDrawer()} icon={Icons.menu} />,
      headerRight: <NavigationButton onPress={() => navigation.navigate('Edit', { title: Strings.edit.titleAdd })} icon={Icons.add}
      />,
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      apiToken: '',
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
      searchText: '',
      isSearchActive: false,
      searchResults: null,
    }
  }

  componentDidMount() {
    Storage.userPreferences()
      .then((value) => this.setState(value))
      .then(() => this.onRefresh())
  }

  checkForUpdates = async () => {
    const response = await Api.update(this.state.apiToken)
    if (response.ok === 0) {
      handleResponseError(response.error, this.props.navigation)
    } else if (response.update_time !== this.state.lastUpdateTime) {
      this.setState({ lastUpdateTime: response.update_time })
      return true
    }
    return false
  }

  fetchPosts = async () => {
    const response = await Api.postsAll(this.state.apiToken)
    if(response.ok === 0) {
      handleResponseError(response.error, this.props.navigation)
    } else {
      const str = JSON.stringify(response)
      const obj = JSON.parse(str, reviver)
      const newData = filterPosts(obj)
      const newDataCount = postsCount(newData)
      this.setState({ ...newData, searchResults: this.currentList(true) })
      this.props.navigation.setParams(newDataCount)
    }
  }

  updatePost = async (post) => {
    post.toread = !post.toread
    const newCollection = merge(this.state.allPosts, post)
    const newData = filterPosts(newCollection)
    const newDataCount = postsCount(newData)
    this.setState({ ...newData, searchResults: this.currentList(true) })
    this.props.navigation.setParams(newDataCount)
    const response = await Api.postsAdd(post, this.state.apiToken)
    if(response.ok === 0) {
      handleResponseError(response.error, this.props.navigation)
    }
  }

  deletePost = async (post) => {
    const newCollection = reject(this.state.allPosts, { href: post.href })
    const newData = filterPosts(newCollection)
    const newDataCount = postsCount(newData)
    this.setState({ ...newData, searchResults: this.currentList(true) })
    this.props.navigation.setParams(newDataCount)
    const response = await Api.postsDelete(post, this.state.apiToken)
    if(response.ok === 0) {
      handleResponseError(response.error, this.props.navigation)
    }
  }

  filterSearchResults = (text) => {
    return filter(this.currentList(), post => {
      const postData = `
        ${post.description.toLowerCase()}
        ${post.extended.toLowerCase()}
        ${post.tags ? post.tags.join(' ').toLowerCase() : ''}
      `
      return postData.includes(text.toLocaleString())
    })
  }

  currentList = (shouldFilter) => {
    const current = this.props.navigation.getParam('list', 'allPosts')
    if (shouldFilter) {
      return this.filterSearchResults(this.state.searchText)
    }
    return this.state[current]
  }

  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
  }

  onRefresh = async () => {
    this.setState({ refreshing: true })
    const hasUpdates = await this.checkForUpdates()
    if (hasUpdates) {
      await this.fetchPosts()
    }
    this.setState({ refreshing: false })
  }

  onSearchChange = (evt) => {
    const searchText = evt.nativeEvent ? evt.nativeEvent.text : evt
    const searchTextArray = searchText.toLowerCase().split(' ')
    this.setState({
      searchText: searchText,
      isSearchActive: searchText === '' ? false : true,
    })
    const searchResults = map(searchTextArray, text => this.filterSearchResults(text))
    const uniqueSearchResults = intersection(...searchResults)
    this.setState({ searchResults: uniqueSearchResults })
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
    this.toggleModal()
    this.props.navigation.navigate('Edit', { title: Strings.edit.titleEdit, post: post })
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

  renderListHeader = () => {
    if (!this.currentList()) { return null }
    return (
      <SearchBar
        isSearchActive={this.state.isSearchActive}
        searchText={this.state.searchText}
        onSearchChange={this.onSearchChange}
      />
    )
  }

  renderPostCell = (item) => {
    return (
      <PostCell
        post={item}
        onCellPress={this.onCellPress}
        onCellLongPress={this.onCellLongPress}
        exactDate={this.state.exactDate}
        tagOrder={this.state.tagOrder}
      />
    )
  }

  renderRefreshControl = () => {
    return (
      <RefreshControl
        refreshing={this.state.refreshing}
        onRefresh={this.onRefresh}
      />
    )
  }

  renderEmptyState = () => {
    const { allPosts, refreshing, isSearchActive, searchText } = this.state
    if (isSearchActive) {
      return <EmptyState title={Strings.common.noResults} subtitle={`“${searchText}“`} />
    } else if (!allPosts && !refreshing) {
      return <EmptyState title={Strings.common.noPosts} subtitle={Strings.common.noPostsMessage} icon={Icons.simplepin} />
    } else {
      return null
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={this.state.isSearchActive ? this.state.searchResults : this.currentList()}
          initialNumToRender={8}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => this.renderPostCell(item)}
          refreshControl={this.renderRefreshControl()}
          style={styles.container}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          ItemSeparatorComponent={() => <Separator left={Base.padding.large} />}
          ListEmptyComponent={this.renderEmptyState()}
          ListHeaderComponent={this.renderListHeader()}
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
    paddingBottom: Base.padding.tiny,
  },
})
