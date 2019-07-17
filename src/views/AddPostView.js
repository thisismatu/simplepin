import React from 'react'
import { Alert, Animated, BackHandler, Platform, SectionList, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import isUrl from 'is-url'
import PropTypes from 'prop-types'
import compact from 'lodash/compact'
import difference from 'lodash/difference'
import filter from 'lodash/filter'
import flattenDeep from 'lodash/flattenDeep'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import keys from 'lodash/keys'
import lodash from 'lodash/lodash'
import pick from 'lodash/pick'
import uniq from 'lodash/uniq' // eslint-disable-line no-unused-vars
import Api from '../Api'
import Storage from '../Storage'
import { handleResponseError } from '../util/ErrorUtil'
import NavigationButton from '../components/NavigationButton'
import Separator from '../components/Separator'
import Switch from '../components/SimpleSwitch'
import Tag from '../components/Tag'
import { color, padding, font, line, row, radius, icons, shadow } from '../style/style'
import strings from '../style/strings'

const isAndroid = Platform.OS === 'android'
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

const getPostObject = (obj) => {
  return pick(obj, 'postDescription', 'postExtended', 'postHref', 'postHash', 'postShared', 'postTags', 'postTime', 'postToread')
}

const ResultItem = ({ tag, suggested, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => onPress(tag)}
      style={s.resultCell}
    >
      <Text style={s.resultText}>{tag}</Text>
      {!!suggested && <Text style={s.suggestedText}>Suggested</Text>}
    </TouchableOpacity>
  )
}

export default class AddPostView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const post = navigation.getParam('post')
    const title = post ? strings.add.titleEdit : strings.add.titleAdd
    const saveText = navigation.getParam('post') ? strings.add.buttonSave : strings.add.buttonAdd
    return {
      title,
      headerLeft: <NavigationButton onPress={navigation.getParam('onDismiss')} icon={icons.close} />,
      headerRight: <NavigationButton onPress={navigation.getParam('onSave')} text={saveText} />,
    }
  }

  constructor(props) {
    super(props)
    this.shakeValue = new Animated.Value(0)
    this.shakeStyle = {
      transform: [{
        translateX: this.shakeValue.interpolate({
          inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
          outputRange: [0, 3, -3, 3, -3, 0, 3, -3, 3, -3, 0],
        }),
      }],
    }
    this.init = false
    this.unsavedChanges = false
    this.contentOffset = 0
    this.searchHeight = 200
    this.suggestedTags = []
    this.userTags = []
    this.state = {
      validHref: false,
      validDescription: false,
      scrollEnabled: true,
      searchQuery: '',
      searchResults: {},
      searchVisible: false,
      postDescription: '',
      postExtended: '',
      postHash: '',
      postHref: '',
      postShared: true,
      postTags: [],
      postTime: new Date(),
      postToread: false,
    }
  }

  componentDidMount() {
    const { navigation } = this.props
    const passedPost = navigation.getParam('post')
    if (passedPost) {
      this.setState({
        postDescription: passedPost.description,
        postExtended: passedPost.extended,
        postHash: passedPost.hash,
        postHref: passedPost.href,
        postShared: passedPost.shared,
        postTags: passedPost.tags,
        postTime: passedPost.time,
        postToread: passedPost.toread,
      }, () => { this.init = true })
    } else {
      Storage.userPreferences().then(prefs => {
        this.setState({
          postShared: !prefs.privateByDefault,
          postToread: prefs.unreadByDefault,
        }, () => { this.init = true })
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

  componentDidUpdate(prevProps, prevState) {
    if (!this.init) return
    const currStatePost = getPostObject(this.state)
    const prevStatePost = getPostObject(prevState)
    if (!isEqual(prevStatePost, currStatePost)) {
      this.unsavedChanges = true
    }
  }

  componentWillUnmount() {
    if (isAndroid) {
      BackHandler.removeEventListener('hardwareBackPress', this.onAndroidBack)
    }
  }

  fetchTags = async () => {
    const apiToken = await Storage.apiToken()
    const response = await Api.tagsAll(apiToken)
    const suggested = await Api.tagsSuggested(this.state.postHref, apiToken)
    if (response.ok === 0) {
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

  animate = () => {
    this.shakeValue.setValue(0)
    Animated.timing(this.shakeValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }

  isValidPost = (href, description) => {
    const validHref = isUrl(href)
    const validDescription = !isEmpty(description)
    if (isEmpty(href) && !validDescription) ToastAndroid.showWithGravity(strings.error.emptyUrlDescription, ToastAndroid.SHORT, ToastAndroid.CENTER)
    if (!isEmpty(href) && !validHref) ToastAndroid.showWithGravity(strings.error.invalidUrl, ToastAndroid.SHORT, ToastAndroid.CENTER)
    if (validHref && !validDescription) ToastAndroid.showWithGravity(strings.error.emptyTitle, ToastAndroid.SHORT, ToastAndroid.CENTER)
    this.setState({ validHref, validDescription }, () => this.animate())
    return validHref && validDescription
  }

  onUnsavedDismiss = () => {
    const { navigation } = this.props
    if (this.unsavedChanges) {
      Alert.alert(
        strings.add.discardUnsaved, null,
        [
          { text: strings.common.cancel, style: 'cancel' },
          { text: strings.common.discard, onPress: () => navigation.dismiss() }
        ]
      )
    } else {
      navigation.dismiss()
    }
  }

  onAndroidBack = () => {
    this.onUnsavedDismiss()
    return true
  }

  onHrefChange = evt => {
    const href = evt.nativeEvent.text.trim().replace(/\s+/g, '')
    this.setState({ postHref: href })
  }

  onDescriptionChange = evt => {
    this.setState({ postDescription: evt.nativeEvent.text })
  }

  onExtendedChange = evt => {
    this.setState({ postExtended: evt.nativeEvent.text })
  }

  onShared = value => {
    this.setState({ postShared: !value })
  }

  onToread = value => {
    this.setState({ postToread: value })
  }

  onTagsChange = evt => {
    const query = evt.nativeEvent.text.trim()
    this.setState({ searchQuery: query })
    this.filterSearchResults(query)
  }

  filterSearchResults = text => {
    const { postTags } = this.state
    const suggestedTagsResults = filter(difference(this.suggestedTags, postTags), tag => tag.includes(text))
    const userTagsResults = filter(difference(this.userTags, flattenDeep([postTags, this.suggestedTags])), tag => tag.includes(text))
    const searchResults = flattenDeep([suggestedTagsResults, userTagsResults])
    const searchVisible = !isEmpty(searchResults) && !isEmpty(text)
    this.setState({
      searchVisible,
      scrollEnabled: !searchVisible,
      searchResults: {
        suggested: suggestedTagsResults,
        user: userTagsResults,
      },
    })
  }

  removeTag = tagToRemove => {
    const { postTags } = this.state
    const updatedTags = filter(postTags, tag => tag !== tagToRemove)
    this.setState({ postTags: updatedTags })
  }

  selectTag = tag => {
    const { postTags } = this.state
    if (isEmpty(tag) || postTags.includes(tag)) return
    postTags.push(tag)
    this.setState({
      searchVisible: false,
      scrollEnabled: true,
      searchQuery: '',
      postTags,
    })
  }

  onSave = () => {
    const { navigation } = this.props
    const { postDescription, postExtended, postHash, postHref, postShared, postTags, postTime, postToread } = this.state
    if (!this.isValidPost(postHref, postDescription)) return
    const post = {
      description: postDescription.trim(),
      extended: postExtended.trim(),
      href: postHref,
      hash: postHash,
      meta: Math.random().toString(36), // PostCell change detection
      shared: postShared,
      tags: compact(postTags),
      time: postTime,
      toread: postToread,
    }
    navigation.state.params.onSubmit(post)
    navigation.dismiss()
  }

  renderSearchResults = () => {
    const { searchResults } = this.state
    const containerHeight = { height: this.searchHeight - this.contentOffset - padding.small }
    const topOffset = { top: this.contentOffset }
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[s.resultsOverlay, topOffset]}
        onPress={() => this.setState({ searchVisible: false, scrollEnabled: true })}
      >
        <View style={[s.resultsContainer, containerHeight]}>
          <SectionList
            sections={[{
              data: searchResults.suggested,
              renderItem: ({ item }) => <ResultItem tag={item} suggested={true} onPress={this.selectTag} />,
            }, {
              data: searchResults.user,
              renderItem: ({ item }) => <ResultItem tag={item} suggested={false} onPress={this.selectTag} />,
            }]}
            keyExtractor={(item, index) => item + index}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            contentContainerStyle={s.resultsList}
          />
        </View>
      </TouchableOpacity>
    )
  }

  renderTags = () => {
    const { postTags } = this.state
    return (
      <View style={s.tagContainer}>
        {postTags.map(item => {
          return <Tag key={item} tag={item} onPress={this.removeTag} icon />
        })}
      </View>
    )
  }

  render() {
    const { scrollEnabled, searchQuery, searchVisible, validHref, validDescription } = this.state
    const { postDescription, postExtended, postHref, postShared, postTags, postToread } = this.state
    return (
      <SafeAreaView style={s.safeArea} forceInset={{ bottom: 'never' }}>
        <KeyboardAwareScrollView
          scrollEnabled={scrollEnabled}
          contentContainerStyle={s.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          style={s.list}
          onScroll={evt => { this.contentOffset = evt.nativeEvent.contentOffset.y }}
        >
          <AnimatedTextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            keyboardType="url"
            onChange={this.onHrefChange}
            onSubmitEditing={() => this.descriptionRef.getNode().focus()}
            placeholder={strings.add.placeholderHref}
            placeholderTextColor={color.gray2}
            returnKeyType="next"
            style={[s.textInput, !validHref && this.shakeStyle]}
            underlineColorAndroid="transparent"
            value={postHref}
          />
          <Separator />
          <AnimatedTextInput
            autoCapitalize="words"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onDescriptionChange}
            onSubmitEditing={() => this.extendedRef.focus()}
            placeholder={strings.add.placeholderDescription}
            placeholderTextColor={color.gray2}
            ref={input => { this.descriptionRef = input }}
            returnKeyType="next"
            style={[s.textInput, !validDescription && this.shakeStyle]}
            underlineColorAndroid="transparent"
            value={postDescription}
          />
          <Separator />
          <TextInput
            autoCapitalize="words"
            autoCorrect={true}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            multiline={true}
            onChange={this.onExtendedChange}
            onSubmitEditing={() => this.tagsRef.focus()}
            placeholder={strings.add.placeholderExtended}
            placeholderTextColor={color.gray2}
            ref={input => { this.extendedRef = input }}
            returnKeyType="next"
            style={[s.textInput, s.textArea]}
            textAlignVertical="top"
            underlineColorAndroid="transparent"
            value={postExtended}
          />
          <Separator onLayout={evt => { this.searchHeight = evt.nativeEvent.layout.y }} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onTagsChange}
            onSubmitEditing={() => this.selectTag(searchQuery)}
            onBlur={() => this.selectTag(searchQuery)}
            placeholder={strings.add.placeholderTags}
            placeholderTextColor={color.gray2}
            ref={input => { this.tagsRef = input }}
            returnKeyType="done"
            style={s.textInput}
            underlineColorAndroid="transparent"
            value={searchQuery}
          />
          {!isEmpty(postTags) && this.renderTags()}
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.posts.private}</Text>
            <Switch
              onValueChange={this.onShared}
              value={!postShared}
            />
          </View>
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.add.readLater}</Text>
            <Switch
              onValueChange={this.onToread}
              value={postToread}
            />
          </View>
          <Separator />
          { searchVisible && this.renderSearchResults() }
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
    flex: 1,
    backgroundColor: color.white,
  },
  container: {
    paddingVertical: padding.medium,
  },
  list: {
    backgroundColor: color.white,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: row.medium,
  },
  text: {
    color: color.gray4,
    fontSize: font.large,
    paddingLeft: padding.medium,
  },
  textInput: {
    backgroundColor: color.white,
    color: color.gray4,
    fontSize: font.large,
    height: row.medium,
    paddingHorizontal: padding.medium,
    width: '100%',
  },
  textArea: {
    height: 100,
    marginVertical: 9,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: padding.small,
  },
  resultsOverlay: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    zIndex: 9999,
  },
  resultsContainer: {
    margin: padding.small,
    backgroundColor: color.white,
    borderRadius: radius.medium,
    ...shadow,
  },
  resultsList: {
    paddingVertical: padding.small,
  },
  resultCell: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: padding.medium,
    paddingVertical: padding.small,
  },
  resultText: {
    fontSize: font.medium,
    lineHeight: line.medium,
  },
  suggestedText: {
    color: color.gray3,
    fontSize: font.small,
  },
})
