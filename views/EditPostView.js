import React from 'react'
import { SafeAreaView, View, StyleSheet, Platform, Text, TextInput, ScrollView, Switch, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import compact from 'lodash/compact'
import Storage from 'app/util/Storage'
import NavigationButton from 'app/components/NavigationButton'
import Separator from 'app/components/Separator'
import Base from 'app/style/Base'
import Strings from 'app/style/Strings'
import Icons from 'app/style/Icons'

const isAndroid = Platform.OS === 'android'

export default class EditPostView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title', ''),
      headerLeft: <NavigationButton onPress={() => navigation.dismiss()} icon={Icons.close} />,
    }
  }

  constructor(props) {
    super(props)
    const post = props.navigation.getParam('post', {})
    this.isEditing = props.navigation.getParam('isEditing', false)
    this.state = {
      description: post.description,
      extended: post.extended,
      href: post.href,
      shared: post.shared,
      tags: post.tags,
      time: post.time || new Date(),
      toread: post.toread,
    }
  }

  componentDidMount() {
    if (!this.isEditing) {
      Storage.userPreferences().then(value => {
        this.setState({
          shared: !value.privateByDefault,
          toread: value.unreadByDefault,
        })
      })
    }
  }

  onHrefChange = (evt) => {
    this.setState({ href: evt.nativeEvent.text.trim() })
  }

  onDescriptionChange = (evt) => {
    this.setState({ description: evt.nativeEvent.text.trim() })
  }

  onExtendedChange = (evt) => {
    this.setState({ extended: evt.nativeEvent.text.trim() })
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

  onAddEdit = () => {
    const post = this.state
    post.tags = compact(post.tags)
    console.log(post)
  }

  render() {
    const { description, extended, href, shared, tags, toread } = this.state
    const track = isAndroid ? Base.color.blue2 + '88' : Base.color.blue2
    const thumb = (isEnabled) => isAndroid && isEnabled ? Base.color.blue2 : null

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.section}>
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
          </View>
          <View style={[styles.section, { paddingHorizontal: Base.padding.medium }]}>
            <TouchableOpacity
              activeOpacity={0.5}
              // disabled={!href && !description}
              style={[styles.button, !href && !description && styles.disabled]}
              onPress={() => this.onAddEdit()}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

EditPostView.propTypes = {
  navigation: PropTypes.object.isRequired,
  post: PropTypes.shape({
    description: PropTypes.string.isRequired,
    extended: PropTypes.string,
    hash: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    meta: PropTypes.string.isRequired,
    shared: PropTypes.bool.isRequired,
    tags: PropTypes.array,
    time: PropTypes.object.isRequired,
    toread: PropTypes.bool.isRequired,
  }),
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Base.color.white,
    flex: 1,
  },
  container: {
    backgroundColor: Base.color.white,
  },
  section: {
    paddingVertical: Base.padding.medium,
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
    backgroundColor: Base.color.blue2,
    borderRadius: Base.radius.medium,
    paddingHorizontal: Base.padding.medium,
    width: '100%',
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
