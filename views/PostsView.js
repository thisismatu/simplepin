import React from 'react'
import { StyleSheet, FlatList, RefreshControl, View, Alert, Linking, Vibration, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import PropTypes from 'prop-types'
import rssParser from 'react-native-rss-parser'
import filter from 'lodash/filter'
import fromPairs from 'lodash/fromPairs' // eslint-disable-line no-unused-vars
import omit from 'lodash/omit' // eslint-disable-line no-unused-vars
import intersection from 'lodash/intersection'
import lodash from 'lodash/lodash'
import map from 'lodash/map'
import maxBy from 'lodash/maxBy'
import reject from 'lodash/reject'
import uniqBy from 'lodash/uniqBy'
import findIndex from 'lodash/findIndex'
import get from 'lodash/get'
import includes from 'lodash/includes'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import Api from 'app/Api'
import Storage from 'app/Storage'
import { reviver } from 'app/util/JsonUtil'
import { handleResponseError } from 'app/util/ErrorUtil'
import { openShareDialog } from 'app/util/ShareUtil'
import NavigationButton from 'app/components/NavigationButton'
import PostCell from 'app/components/PostCell'
import Separator from 'app/components/Separator'
import BottomSheet from 'app/components/BottomSheet'
import SearchBar from 'app/components/SearchBar'
import EmptyState from 'app/components/EmptyState'
import { color, padding, icons } from 'app/style/style'
import strings from 'app/style/strings'

const filterPosts = obj => {
  return {
    allPosts: obj,
    unreadPosts: filter(obj, ['toread', true]),
    privatePosts: filter(obj, ['shared', false]),
    publicPosts: filter(obj, ['shared', true]),
    starredPosts: filter(obj, ['starred', true]),
  }
}

const postsCount = obj => {
  return {
    allCount: obj.allPosts.length,
    unreadCount: obj.unreadPosts.length,
    privateCount: obj.privatePosts.length,
    publicCount: obj.publicPosts.length,
    starredCount: obj.starredPosts.length,
  }
}

export default class PostsView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', strings.posts.all),
      headerLeft: <NavigationButton onPress={navigation.getParam('openDrawer')} icon={icons.menu} />,
      headerRight: <NavigationButton onPress={() => navigation.navigate('Add', { onSubmit: navigation.getParam('onSubmit') })} icon={icons.add} />,
    }
  }

  constructor(props) {
    super(props)
    this.keyboardHeight = 0
    this.state = {
      isLoading: false,
      allPosts: null,
      unreadPosts: null,
      privatePosts: null,
      publicPosts: null,
      lastUpdateTime: null,
      modalVisible: false,
      selectedPost: {},
      isSearchActive: false,
      searchQuery: '',
      searchQueryCounts: null,
      searchResults: null,
      pinboardDown: false,
      preferences: {
        apiToken: null,
        exactDate: false,
        markAsRead: false,
        tagOrder: false,
        openLinksExternal: true,
      },
    }
  }

  componentDidMount() {
    const { navigation } = this.props
    navigation.setParams({ onSubmit: this.onSubmitAddPost })
    navigation.setParams({ openDrawer: this.openDrawer })
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
    Storage.userPreferences()
      .then(prefs => this.setState({ preferences: prefs }))
      .then(() => this.onRefresh())
  }

  componentDidUpdate(prevProps, prevState) {
    Storage.userPreferences().then(prefs => {
      if (!isEqual(prevState.preferences, prefs)) {
        this.setState({ preferences: prefs })
      }
    })
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }

  keyboardDidShow = evt => {
    this.keyboardHeight = evt && evt.endCoordinates.height
  }

  keyboardDidHide = evt => {
    this.keyboardHeight = evt && evt.endCoordinates.height
  }

  checkForUpdates = async () => {
    const { apiToken } = this.state.preferences
    const response = await Api.postsUpdate(apiToken)
    if (response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    } else if (response.update_time !== this.state.lastUpdateTime) {
      this.setState({ lastUpdateTime: response.update_time })
      return true
    }
    return false
  }

  fetchPosts = async () => {
    const { apiToken } = this.state.preferences
    const response = await Api.postsAll(apiToken)
    const secret = await Api.userSecret(apiToken)
    const starred = await Api.postsStarred(secret.result, apiToken)
    if(response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    } else if (secret.ok === 0 || starred.ok === 0) {
      const jsonString = JSON.stringify(response)
      const jsonObject = JSON.parse(jsonString, reviver)
      const newData = filterPosts(uniqBy(jsonObject, 'hash'))
      const newDataCount = postsCount(newData)
      this.setState({ ...newData, searchResults: this.currentList(true) })
      this.props.navigation.setParams(newDataCount)
    } else {
      const rssObject = await rssParser.parse(starred)
      const jsonString = JSON.stringify(response)
      const jsonObject = JSON.parse(jsonString, reviver)
      const starredLinks = map(rssObject.items, item => get(item.links, ['0', 'url']))
      const uniqPostsStarred = lodash(jsonObject)
        .uniqBy('hash')
        .map(o => {
          o.starred = includes(starredLinks, o.href)
          return o
        })
        .value()
      const newData = filterPosts(uniqPostsStarred)
      const newDataCount = postsCount(newData)
      this.setState({ ...newData, searchResults: this.currentList(true) })
      this.props.navigation.setParams(newDataCount)
    }
  }

  addPost = async post => {
    const { apiToken } = this.state.preferences
    const index = findIndex(this.state.allPosts, ['hash', post.hash])
    const newCollection = this.state.allPosts
    if (index === -1) {
      newCollection.unshift(post)
    } else {
      newCollection[index] = post
    }
    const newData = filterPosts(newCollection)
    const newDataCount = postsCount(newData)
    this.setState({ ...newData, searchResults: this.currentList(true) })
    this.props.navigation.setParams(newDataCount)
    const response = await Api.postsAdd(post, apiToken)
    if(response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    }
  }

  deletePost = async post => {
    const { apiToken } = this.state.preferences
    const newCollection = reject(this.state.allPosts, { href: post.href })
    const newData = filterPosts(newCollection)
    const newDataCount = postsCount(newData)
    this.setState({ ...newData, searchResults: this.currentList(true) })
    this.props.navigation.setParams(newDataCount)
    const response = await Api.postsDelete(post.href, apiToken)
    if(response.ok === 0) {
      if ( response.error === 503) { this.setState({ pinboardDown: true }) }
      handleResponseError(response.error, this.props.navigation)
    }
  }

  filterSearchResults = (text, tags = false) => {
    return filter(this.currentList(), post => {
      const tagData = post.tags ? post.tags.join(' ').toLowerCase() : ''
      const postData = `
        ${post.href.toLowerCase()}
        ${post.description.toLowerCase()}
        ${post.extended.toLowerCase()}
        ${post.tags ? post.tags.join(' ').toLowerCase() : ''}
      `
      const returnData = tags ? tagData : postData
      return returnData.includes(text)
    })
  }

  similarSearchResults = () => {
    const { searchQueryCounts } = this.state
    const similarQuery = maxBy(Object.keys(searchQueryCounts), o => searchQueryCounts[o])
    const similarResults = this.filterSearchResults(similarQuery)
    return {
      searchResults: similarResults,
      searchQuery: similarQuery,
    }
  }

  currentList = shouldFilter => {
    const current = this.props.navigation.getParam('list', 'allPosts')
    if (shouldFilter) {
      return this.filterSearchResults(this.state.searchQuery)
    }
    return this.state[current]
  }

  openDrawer = () => {
    Keyboard.dismiss()
    this.onSearchChange('')
    this.props.navigation.openDrawer()
  }

  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible })
  }

  onRefresh = async () => {
    this.setState({ isLoading: true })
    const hasUpdates = await this.checkForUpdates()
    if (hasUpdates) {
      await this.fetchPosts()
    }
    this.setState({ isLoading: false })
  }

  onSearchChange = (evt, tags) => {
    const searchQuery = evt.nativeEvent ? evt.nativeEvent.text : evt
    const searchQueryArray = searchQuery.toLowerCase().split(' ')
    this.setState({
      searchQuery: searchQuery,
      isSearchActive: searchQuery === '' ? false : true,
    })
    const allResults = map(searchQueryArray, text => this.filterSearchResults(text, tags))
    const queryCounts = lodash(allResults)
      .map((res, i) => [searchQueryArray[i], res.length])
      .fromPairs()
      .omit('')
      .value()
    const uniqueResults = intersection(...allResults)
    this.setState({
      searchResults: uniqueResults,
      searchQueryCounts: queryCounts,
    })
  }

  onShowSimilarResults = () => {
    const similarResults = this.similarSearchResults()
    if (similarResults.searchResults.length > 0) {
      this.setState(similarResults)
    }
  }

  onSubmitAddPost = post => {
    this.addPost(post)
  }

  onTagPress = tag => () => {
    this.onSearchChange(tag, true)
    this.listRef.scrollToOffset({ offset: 0, animated: false })
  }

  onCellPress = post => () => {
    const { openLinksExternal, markAsRead } = this.state.preferences
    if (openLinksExternal || includes(post.href, '.pdf')) {
      Linking.canOpenURL(post.href).then(() => {
        Linking.openURL(post.href)
      })
    } else {
      this.props.navigation.navigate('Browser', { title: post.description, url: post.href })
    }
    if (markAsRead && post.toread) {
      post.toread = !post.toread
      post.meta = Math.random().toString(36) // PostCell change detection
      this.addPost(post)
    }
  }

  onCellLongPress = post => () => {
    Vibration.vibrate(5)
    this.toggleModal()
    this.setState({ selectedPost: post })
  }

  onToggleToread = () => {
    const post = this.state.selectedPost
    this.toggleModal()
    post.toread = !post.toread
    post.meta = Math.random().toString(36) // PostCell change detection
    this.addPost(post)
  }

  onEditPost = () => {
    const { navigation } = this.props
    const post = this.state.selectedPost
    this.toggleModal()
    navigation.navigate('Add', { post: post, onSubmit: navigation.getParam('onSubmit') })
  }

  onSharePost = () => {
    const post = this.state.selectedPost
    this.setState({ modalVisible: false }, () => {
      // Timeout needed to fix opening share dialog from modal
      setTimeout(() => {
        openShareDialog(post.href, post.description)
      }, 500)
    })
  }

  onDeletePost = () => {
    const post = this.state.selectedPost
    Alert.alert(
      strings.common.deletePost,
      post.description,
      [
        { text: strings.common.cancel, style: 'cancel' },
        { text: strings.common.delete,
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
        searchQuery={this.state.searchQuery}
        onSearchChange={this.onSearchChange}
        count={this.state.searchResults.length}
      />
    )
  }

  renderPostCell = item => {
    return (
      <PostCell
        post={item}
        changeDetection={item.meta}
        onTagPress={this.onTagPress}
        onCellPress={this.onCellPress}
        onCellLongPress={this.onCellLongPress}
        exactDate={this.state.preferences.exactDate}
        tagOrder={this.state.preferences.tagOrder}
      />
    )
  }

  renderRefreshControl = () => {
    return (
      <RefreshControl
        refreshing={this.state.isLoading}
        onRefresh={this.onRefresh}
      />
    )
  }

  renderEmptyState = () => {
    const { isLoading, pinboardDown, isSearchActive, searchQuery } = this.state
    const { apiToken } = this.state.preferences
    if (!apiToken) { return null }
    if (isSearchActive) {
      const similarResults = this.similarSearchResults()
      return <EmptyState
        action={ similarResults.searchResults.length > 0 ? this.onShowSimilarResults : undefined }
        actionText={`Show results for “${similarResults.searchQuery}”`}
        icon={icons.searchLarge}
        subtitle={`“${searchQuery}“`}
        title={strings.common.noResults}
        paddingBottom={this.keyboardHeight} />
    }
    if (pinboardDown) {
      return <EmptyState
        action={this.onRefresh}
        actionText={strings.common.tryAgain}
        icon={icons.offlineLarge}
        subtitle={strings.error.pinboardDown}
        title={strings.error.troubleConnecting}
        paddingBottom={this.keyboardHeight} />
    }
    if (isEmpty(this.currentList()) && !isLoading) {
      const { navigation } = this.props
      return <EmptyState
        action={() => navigation.navigate('Add', { onSubmit: navigation.getParam('onSubmit') })}
        actionText={strings.add.titleAdd}
        icon={icons.simplepin}
        subtitle={strings.common.noPostsMessage}
        title={strings.common.noPosts}
        paddingBottom={this.keyboardHeight} />
    }
    return null
  }

  render() {
    const { selectedPost } = this.state
    const data = this.state.isSearchActive ? this.state.searchResults : this.currentList()
    return (
      <React.Fragment>
        <SafeAreaView style={s.safeArea} forceInset={{ bottom: 'never' }}>
          <FlatList
            ref={(ref) => this.listRef = ref}
            contentContainerStyle={s.container}
            data={data}
            initialNumToRender={8}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => this.renderPostCell(item)}
            refreshControl={this.renderRefreshControl()}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            style={s.list}
            ItemSeparatorComponent={() => <Separator left={padding.large} />}
            ListEmptyComponent={this.renderEmptyState()}
            ListHeaderComponent={this.renderListHeader()}
          />
        </SafeAreaView>
        <BottomSheet visible={this.state.modalVisible} onClose={this.toggleModal}>
          <BottomSheet.Title title={selectedPost.description} />
          <BottomSheet.Option title={`${strings.common.markAs} ${selectedPost.toread ? 'read' : 'unread'}`} onPress={this.onToggleToread} />
          <BottomSheet.Option title={strings.common.edit} onPress={this.onEditPost} />
          <BottomSheet.Option title={strings.common.share} onPress={this.onSharePost} />
          <BottomSheet.Option title={strings.common.delete} onPress={this.onDeletePost} />
          <BottomSheet.Option title={strings.common.cancel} onPress={this.toggleModal} />
        </BottomSheet>
      </React.Fragment>
    )
  }
}

PostsView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: color.white,
  },
  container : {
    flexGrow: 1,
    paddingTop: padding.medium,
    paddingBottom: padding.large,
  },
  list: {
    backgroundColor: color.white,
  },
})
