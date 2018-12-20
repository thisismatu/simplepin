import React from 'react'
import { SafeAreaView, View, StyleSheet, Platform, Text, TextInput, ScrollView, Switch, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
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
    this.state = {
      post: this.props.navigation.getParam('post', ''),
      privateByDefault: false,
      unreadByDefault: false,
    }
  }

  componentDidMount() {
    Storage.userPreferences().then((value) => this.setState(value))
    console.log(this.state)
  }

  render() {
    const { post } = this.state
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
              placeholder="URL"
              placeholderTextColor = {Base.color.gray2}
              returnKeyType="next"
              style={styles.textInput}
              underlineColorAndroid="transparent"
              value={post.href}
            />
            <Separator />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              enablesReturnKeyAutomatically={true}
              placeholder="Title"
              placeholderTextColor = {Base.color.gray2}
              returnKeyType="next"
              style={styles.textInput}
              underlineColorAndroid="transparent"
              value={post.description}
            />
            <Separator />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              enablesReturnKeyAutomatically={true}
              multiline={true}
              placeholder="Description"
              placeholderTextColor = {Base.color.gray2}
              returnKeyType="next"
              style={[styles.textInput, styles.textArea]}
              underlineColorAndroid="transparent"
              value={post.extended}
            />
            <Separator />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              enablesReturnKeyAutomatically={true}
              placeholder="Tags"
              placeholderTextColor = {Base.color.gray2}
              returnKeyType="next"
              style={styles.textInput}
              underlineColorAndroid="transparent"
              value={post.tags ? post.tags.join(' ') : null}
            />
            <Separator />
            <View style={styles.cell}>
              <Text style={styles.text}>Private</Text>
              <Switch
                style={styles.switch}
                trackColor={{ true: track }}
                value={post ? !post.shared : this.state.privateByDefault}
              />
            </View>
            <Separator />
            <View style={styles.cell}>
              <Text style={styles.text}>Read later</Text>
              <Switch
                style={styles.switch}
                trackColor={{ true: track }}
                value={post ? post.toread : this.state.unreadByDefault}
              />
            </View>
            <Separator />
          </View>
          <View style={[styles.section, { paddingHorizontal: Base.padding.medium }]}>
            <TouchableOpacity
              activeOpacity={0.5}
              disabled={!post.href && !post.description}
              style={[styles.button, !post.href && !post.description && styles.disabled]}
              onPress={() => this.props.navigation.dismiss()}
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
