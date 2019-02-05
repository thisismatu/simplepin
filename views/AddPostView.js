import React from 'react'
import { SafeAreaView, View, StyleSheet, Platform, Image, Text, TextInput, Switch, TouchableOpacity, Alert, BackHandler, SectionList } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PropTypes from 'prop-types'
import lodash from 'lodash/lodash'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import flattenDeep from 'lodash/flattenDeep'
import uniq from 'lodash/uniq'
import omit from 'lodash/omit'
import filter from 'lodash/filter'
import keys from 'lodash/keys'
import map from 'lodash/map'
import difference from 'lodash/difference'
import isUrl from 'is-url'
import Api from 'app/Api'
import { handleResponseError } from 'app/util/ErrorUtils'
import Storage from 'app/util/Storage'
import NavigationButton from 'app/components/NavigationButton'
import Separator from 'app/components/Separator'
import Base from 'app/style/Base'
import Strings from 'app/style/Strings'
import Icons from 'app/style/Icons'

const isAndroid = Platform.OS === 'android'

export default class AddPostView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const post = navigation.getParam('post')
    return {
      title: post ? Strings.add.titleEdit : Strings.add.titleAdd,
      headerLeft: <NavigationButton
        onPress={navigation.getParam('onDismiss')}
        icon={Icons.close}
      />,
      headerRight: <NavigationButton
        onPress={navigation.getParam('onSave')}
        text={post ? Strings.add.buttonSave : Strings.add.buttonAdd}
      />,
    }
  }

  constructor(props) {
    super(props)
    this.isEditing = false
    this.initialState = {}
    this.suggestedTags = []
    this.userTags = []
    this.state = {
      enabled: true,
      searchQuery: '',
      searchResults: [],
      searchHeight: 200,
      searchVisible: false,
      description: '',
      extended: '',
      hash: '',
      href: '',
      meta: '',
      shared: true,
      tags: [],
      time: new Date(),
      toread: false,
    }
  }

  componentDidMount() {
    const { navigation } = this.props
    const post = navigation.getParam('post')
    if (post) {
      this.isEditing = true
      this.setState(post, () => this.setInitialState(this.state))
    } else {
      Storage.userPreferences().then(prefs => {
        this.setState({
          shared: !prefs.privateByDefault,
          toread: prefs.unreadByDefault,
        }, () => this.setInitialState(this.state))
      })
    }
    if (isAndroid) {
      BackHandler.addEventListener('hardwareBackPress', this.onAndroidBack)
    }
    navigation.setParams({
      onDismiss: this.onUnsavedDismiss,
      onSave: this.onSave,
    })
    this.fetchTags()
  }

  componentWillUnmount() {
    if (isAndroid) {
      BackHandler.removeEventListener('hardwareBackPress')
    }
  }

  setInitialState = (currentState) => {
    this.initialState = currentState
  }

  fetchTags = async () => {
    const apiToken = await Storage.apiToken()
    const response = await Api.tagsAll(apiToken)
    const suggested = await Api.tagsSuggested(this.state.href, apiToken)
    if(response.ok === 0) {
      handleResponseError(response.error, this.props.navigation)
    } else {
      const suggestedTags = lodash([suggested[0].popular, suggested[1].recommended])
        .flattenDeep()
        .compact()
        .uniq()
        .value()
      this.suggestedTags = suggestedTags
      this.userTags = keys(response)
    }
  }

  onUnsavedDismiss = () => {
    if (isEqual(this.initialState, this.state)) {
      this.props.navigation.dismiss()
    } else {
      Alert.alert(
        this.isEditing ? Strings.add.discardEdit : Strings.add.discardAdd,
        null,
        [
          { text: Strings.common.cancel, style: 'cancel' },
          { text: Strings.common.ok, onPress: () => this.props.navigation.dismiss() },
        ]
      )
    }
  }

  onAndroidBack = () => {
    this.onUnsavedDismiss()
    return true
  }

  isValidPost = (href, description) => {
    return isUrl(href) && !isEmpty(description)
  }

  onHrefChange = (evt) => {
    this.setState({ href: evt.nativeEvent.text.trim() })
  }

  onDescriptionChange = (evt) => {
    this.setState({ description: evt.nativeEvent.text })
  }

  onExtendedChange = (evt) => {
    this.setState({ extended: evt.nativeEvent.text })
  }

  onTagsChange = (evt) => {
    const query = evt.nativeEvent.text
    this.setState({ searchQuery: query, searchVisible: true })
    if (!isEmpty(query)) {
      const suggestedTagsResults = filter(difference(this.suggestedTags, this.state.tags), tag => tag.includes(query))
      const userTagsResults = filter(difference(this.userTags, flattenDeep([this.state.tags, this.suggestedTags])), tag => tag.includes(query))
      this.setState({ searchResults: {
        suggested: suggestedTagsResults,
        user: userTagsResults,
      } })
      if (isEmpty(flattenDeep([suggestedTagsResults, userTagsResults]))) {
        this.setState({ searchVisible: false })
      }
    } else {
      this.setState({ searchVisible: false })
    }
  }

  onShared = (value) => {
    this.setState({ shared: !value })
  }

  onToread = (value) => {
    this.setState({ toread: value })
  }

  onSave = () => {
    const ignore = ['searchResults', 'enabled', 'searchHeight', 'searchVisible']
    const post = omit(this.state, ignore)
    const tags = compact(post.tags)
    if (!this.isValidPost(post.href, post.description)) { return }
    post.description = post.description.trim()
    post.extended = post.extended.trim()
    post.tags = !isEmpty(tags) ? tags : null
    post.meta = Math.random().toString(36) // PostCell change detection
    this.props.navigation.state.params.onSubmit(post)
    this.props.navigation.dismiss()
  }

  removeTag = (tag) => {
    const { tags } = this.state
    const updatedTags = filter(tags, t =>  t !== tag)
    this.setState({ tags: updatedTags })
  }

  selectTag = (tag) => {
    const { tags } = this.state
    tags.push(tag)
    this.setState({
      tags: tags,
      searchVisible: false,
      searchQuery: '',
    })
    this.tagsInput.focus()
  }

  renderSearchResultItem = (tag, suggested) => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => this.selectTag(tag)}
        style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8 }}
      >
        <Text>{tag}</Text>
        { suggested ? <Text style={{ marginLeft: 4, color: Base.color.gray3, fontSize: 12 }}>Suggested</Text> : null }
      </TouchableOpacity>
    )
  }

  renderSearchResults = () => {
    const { searchResults } = this.state
    return (
      <SectionList
        ref={(ref) => this.flatList = ref}
        sections={[
          { title: 'suggested', data: searchResults.suggested, renderItem: ({ item }) => this.renderSearchResultItem(item, true) },
          { title: 'tags', data: searchResults.user, renderItem: ({ item }) => this.renderSearchResultItem(item) },
        ]}
        keyExtractor={(item, index) => item + index}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        onTouchStart={() => this.setState({ enabled: false }) }
        onMomentumScrollEnd={() => this.setState({ enabled: true }) }
        onScrollEndDrag={() => this.setState({ enabled: true }) }
        style={{ position: 'absolute', top: 0, lef: 0, width: '100%', height: this.state.searchHeight, backgroundColor: '#eee', zIndex: 9999 }}
      />
    )
  }

  renderTags = () => {
    const { tags } = this.state
    return (
      <View style={{ paddingHorizontal: 12, paddingTop: 8, flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
        { map(tags, (tag) => {
          return (
            <TouchableOpacity
              key={tag}
              activeOpacity={0.5}
              onPress={() => this.removeTag(tag)}
              style={{ margin: 4, flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 2 }}
            >
              <Text style={{ padding: 4 }}>{tag}</Text>
              <Image source={Icons.closeSmall} />
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  render() {
    const { description, extended, href, shared, tags, toread, searchResults } = this.state
    const track = isAndroid ? Base.color.blue2 + '88' : Base.color.blue2
    const thumb = (isEnabled) => isAndroid && isEnabled ? Base.color.blue2 : null

    return (
      <SafeAreaView style={s.safeArea}>
        <KeyboardAwareScrollView
          scrollEnabled={this.state.enabled}
          contentContainerStyle={s.container}
          style={s.list}
        >
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onHrefChange}
            onSubmitEditing={() => { this.descriptionInput.focus() }}
            placeholder={Strings.add.placeholderHref}
            placeholderTextColor = {Base.color.gray2}
            returnKeyType="next"
            style={s.textInput}
            underlineColorAndroid="transparent"
            value={href}
          />
          <Separator />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onDescriptionChange}
            onSubmitEditing={() => { this.extendedInput.focus() }}
            placeholder={Strings.add.placeholderDescription}
            placeholderTextColor = {Base.color.gray2}
            ref={(input) => {this.descriptionInput = input}}
            returnKeyType="next"
            style={s.textInput}
            underlineColorAndroid="transparent"
            value={description}
          />
          <Separator />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            multiline={true}
            onChange={this.onExtendedChange}
            onSubmitEditing={() => { this.tagsInput.focus() }}
            placeholder={Strings.add.placeholderExtended}
            placeholderTextColor = {Base.color.gray2}
            ref={(input) => {this.extendedInput = input}}
            returnKeyType="next"
            style={[s.textInput, s.textArea]}
            textAlignVertical="top"
            underlineColorAndroid="transparent"
            value={extended}
          />
          <Separator />
          { !isEmpty(tags) && this.renderTags() }
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onTagsChange}
            onSubmitEditing={evt => this.selectTag(evt.nativeEvent.text)}
            onLayout={evt => this.setState({ searchHeight: evt.nativeEvent.layout.y })}
            placeholder={Strings.add.placeholderTags}
            placeholderTextColor = {Base.color.gray2}
            ref={(input) => {this.tagsInput = input}}
            returnKeyType="done"
            style={s.textInput}
            underlineColorAndroid="transparent"
            value={this.state.searchQuery}
          />
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{Strings.posts.private}</Text>
            <Switch
              style={s.switch}
              trackColor={{ true: track }}
              thumbColor={thumb(!shared)}
              onValueChange={this.onShared}
              value={!shared}
            />
          </View>
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{Strings.add.readLater}</Text>
            <Switch
              style={s.switch}
              trackColor={{ true: track }}
              thumbColor={thumb(toread)}
              onValueChange={this.onToread}
              value={toread}
            />
          </View>
          <Separator />
          { this.state.searchVisible && this.renderSearchResults() }
        </KeyboardAwareScrollView>
      </SafeAreaView>
    )
  }
}

AddPostView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const s = StyleSheet.create({
  safeArea: {
    backgroundColor: Base.color.white,
    flex: 1,
  },
  container: {
    paddingVertical: Base.padding.medium,
  },
  list: {
    backgroundColor: Base.color.white,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: Base.row.medium,
  },
  text: {
    color: Base.color.gray4,
    fontSize: Base.font.large,
    paddingLeft: Base.padding.medium,
  },
  textInput: {
    backgroundColor: Base.color.white,
    color: Base.color.gray4,
    fontSize: Base.font.large,
    height: Base.row.medium,
    paddingHorizontal: Base.padding.medium,
    width: '100%',
  },
  textArea: {
    height: 100,
    marginVertical: 9,
  },
  switch: {
    marginRight: isAndroid ? 12 : Base.padding.medium,
  },
})
