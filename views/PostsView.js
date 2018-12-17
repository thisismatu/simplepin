import React from 'react'
import { StyleSheet, FlatList, RefreshControl, View, Alert, TextInput, TouchableOpacity, Image } from 'react-native'
import filter from 'lodash/filter'
import merge from 'lodash/merge'
import reject from 'lodash/reject'
import PropTypes from 'prop-types'
import Api from 'app/Api'
import Storage from 'app/util/Storage'
import { reviver } from 'app/util/JsonUtils'
import { handleResponseError } from 'app/util/ErrorUtils'
import MenuButton from 'app/components/MenuButton'
import PostCell from 'app/components/PostCell'
import Separator from 'app/components/Separator'
import BottomSheet from 'app/components/BottomSheet'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

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
      headerLeft: <MenuButton onPress={() => navigation.openDrawer()} />,
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
      searchText: '',
      isSearchActive: false,
      searchResults: null,
    }
  }

  componentDidMount() {
    Storage.userPreferences().then((value) => {
      this.setState(value)
    })
    this.onRefresh()
  }

  checkForUpdates = async () => {
    const apiToken = await Storage.apiToken()
    const response = await Api.update(apiToken)
    if (response.ok === 0) {
      handleResponseError(response.error, this.props.navigation)
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
    const apiToken = await Storage.apiToken()
    const response = await Api.postsAdd(post, apiToken)
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
    const apiToken = await Storage.apiToken()
    const response = await Api.postsDelete(post, apiToken)
    if(response.ok === 0) {
      handleResponseError(response.error, this.props.navigation)
    }
  }

  filterSearchResults = (text) => {
    const searchResults = filter(this.currentList(), post => {
      const postData = `
        ${post.description.toLowerCase()}
        ${post.extended.toLowerCase()}
        ${post.tags ? post.tags.join(' ').toLowerCase() : ''}
      `
      return postData.includes(text.toLocaleString())
    })
    return searchResults
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
    this.setState({
      searchText: searchText,
      isSearchActive: searchText === '' ? false : true,
    })
    const searchResults = this.filterSearchResults(searchText)
    this.setState({ searchResults })
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

  renderHeader() {
    const icon = this.state.isSearchActive ? require('app/assets/ic-close-small.png') : require('app/assets/ic-search-small.png')
    return (
      <View style={styles.searchContainer}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          enablesReturnKeyAutomatically={true}
          onChange={this.onSearchChange}
          placeholder="Search…"
          placeholderTextColor = {Base.color.gray2}
          returnKeyType="search"
          style={styles.searchField}
          underlineColorAndroid="transparent"
          value={this.state.searchText}
        />
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => this.onSearchChange('')}
          style={styles.searchClearButton}
        >
          <Image source={icon} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={this.state.isSearchActive ? this.state.searchResults : this.currentList()}
          initialNumToRender={8}
          keyExtractor={(item, index) => index.toString()}
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
          ItemSeparatorComponent={() => <Separator left={Base.padding.large} />}
          ListEmptyComponent={null}
          ListHeaderComponent={this.currentList() ? this.renderHeader() : null}
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
  searchContainer: {
    padding: Base.padding.small,
  },
  searchField: {
    backgroundColor: Base.color.gray0,
    color: Base.color.gray4,
    height: 32,
    paddingHorizontal: Base.padding.medium,
    borderRadius: 100,
  },
  searchClearButton: {
    width: 36,
    height: 32,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  searchIcon: {
    margin: 7,
    marginRight: 11,
    tintColor: Base.color.gray2,
  },
})
