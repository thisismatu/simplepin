import React from 'react'
import { SafeAreaView, View, StyleSheet, Platform, Text, TextInput, ScrollView, Switch, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import isUrl from 'is-url'
import Storage from 'app/util/Storage'
import NavigationButton from 'app/components/NavigationButton'
import Separator from 'app/components/Separator'
import Base from 'app/style/Base'
import Strings from 'app/style/Strings'
import Icons from 'app/style/Icons'

const isAndroid = Platform.OS === 'android'

export default class AddPostView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const post = navigation.getParam('post', {})
    return {
      title: isEmpty(post) ? Strings.edit.titleAdd : Strings.edit.titleEdit,
      headerLeft: <NavigationButton onPress={() => navigation.dismiss()} icon={Icons.close} />,
    }
  }

  constructor(props) {
    super(props)
    this.state = { isEditing: false }
  }

  componentDidMount() {
    const post = this.props.navigation.getParam('post', {})
    Storage.userPreferences().then(value => {
      this.setState({
        isEditing: !isEmpty(post),
        description: post.description || '',
        extended: post.extended || '',
        hash: post.hash || '',
        href: post.href || '',
        meta: post.meta || '',
        shared: post.shared || !value.privateByDefault,
        tags: post.tags || [],
        time: post.time || new Date(),
        toread: post.toread || value.unreadByDefault,
      })
    })
  }

  isValidPost = () => {
    const { href, description } = this.state
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
    this.setState({ tags: evt.nativeEvent.text.split(' ') })
  }

  onShared = (value) => {
    this.setState({ shared: !value })
  }

  onToread = (value) => {
    this.setState({ toread: value })
  }

  onSubmit = () => {
    const post = this.state
    const tags = compact(post.tags)
    post.description = post.description.trim()
    post.extended = post.extended.trim()
    post.tags = !isEmpty(tags) ? tags : null
    post.meta = Math.random().toString(36) // PostCell change detection
    this.props.navigation.state.params.onSubmit(post)
    this.props.navigation.dismiss()
  }

  render() {
    const { description, extended, href, shared, tags, toread } = this.state
    const track = isAndroid ? Base.color.blue2 + '88' : Base.color.blue2
    const thumb = (isEnabled) => isAndroid && isEnabled ? Base.color.blue2 : null

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} style={styles.list}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onHrefChange}
            placeholder="URL"
            placeholderTextColor = {Base.color.gray2}
            returnKeyType="next"
            style={styles.textInput}
            underlineColorAndroid="transparent"
            value={href}
          />
          <Separator />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onDescriptionChange}
            placeholder="Title"
            placeholderTextColor = {Base.color.gray2}
            returnKeyType="next"
            style={styles.textInput}
            underlineColorAndroid="transparent"
            value={description}
          />
          <Separator />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            enablesReturnKeyAutomatically={true}
            multiline={true}
            onChange={this.onExtendedChange}
            placeholder="Description"
            placeholderTextColor = {Base.color.gray2}
            returnKeyType="next"
            style={[styles.textInput, styles.textArea]}
            textAlignVertical="top"
            underlineColorAndroid="transparent"
            value={extended}
          />
          <Separator />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            enablesReturnKeyAutomatically={true}
            onChange={this.onTagsChange}
            placeholder="Tags"
            placeholderTextColor = {Base.color.gray2}
            returnKeyType="done"
            style={styles.textInput}
            underlineColorAndroid="transparent"
            value={tags ? tags.join(' ') : null}
          />
          <Separator />
          <View style={styles.cell}>
            <Text style={styles.text}>Private</Text>
            <Switch
              style={styles.switch}
              trackColor={{ true: track }}
              thumbColor={thumb(!shared)}
              onValueChange={this.onShared}
              value={!shared}
            />
          </View>
          <Separator />
          <View style={styles.cell}>
            <Text style={styles.text}>Read later</Text>
            <Switch
              style={styles.switch}
              trackColor={{ true: track }}
              thumbColor={thumb(toread)}
              onValueChange={this.onToread}
              value={toread}
            />
          </View>
          <Separator />
          <TouchableOpacity
            activeOpacity={0.5}
            disabled={!this.isValidPost()}
            style={[styles.button, !this.isValidPost() && styles.disabled]}
            onPress={() => this.onSubmit()}
          >
            <Text style={styles.buttonText}>{ this.state.isEditing ? 'Save' : 'Add' }</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

AddPostView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
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
  button: {
    flex: 1,
    backgroundColor: Base.color.blue2,
    borderRadius: Base.radius.medium,
    paddingHorizontal: Base.padding.medium,
    marginHorizontal: Base.padding.medium,
    marginTop: Base.padding.huge,
  },
  buttonText: {
    color: Base.color.white,
    fontSize: Base.font.large,
    fontWeight: Base.font.bold,
    lineHeight: Base.row.medium,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
})
