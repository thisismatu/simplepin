import React from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'
import PropTypes from 'prop-types'
import Storage from '../Storage'
import { logout } from '../util/ErrorUtil'
import HeaderCell from '../components/HeaderCell'
import NavigationButton from '../components/NavigationButton'
import Separator from '../components/Separator'
import Switch from '../components/SimpleSwitch'
import { color, padding, font, row, icons } from '../style/style'
import strings from '../style/strings'

export default class SettingsView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: strings.settings.title,
      headerLeft: <NavigationButton onPress={() => navigation.openDrawer()} icon={icons.menu} />,
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      markAsRead: false,
      exactDate: false,
      sortTags: false,
      privateByDefault: false,
      unreadByDefault: false,
      openLinksExternal: false,
      readerMode: true,
    }
  }

  componentDidMount() {
    Storage.userPreferences().then(prefs => this.setState(prefs))
  }

  onMarkAsRead = value => {
    Storage.setMarkAsRead(value)
    this.setState({ markAsRead: value })
  }

  onExactDate = value => {
    Storage.setExactDate(value)
    this.setState({ exactDate: value })
  }

  onSortTags = value => {
    Storage.setSortTags(value)
    this.setState({ sortTags: value })
  }

  onPrivateByDefault = value => {
    Storage.setPrivateByDefault(value)
    this.setState({ privateByDefault: value })
  }

  onUnreadByDefault = value => {
    Storage.setUnreadByDefault(value)
    this.setState({ unreadByDefault: value })
  }

  onOpenLinksExternal = value => {
    Storage.setOpenLinksExternal(value)
    this.setState({ openLinksExternal: value })
  }

  onReaderMode = value => {
    Storage.setReaderMode(value)
    this.setState({ readerMode: value })
  }

  logout = () => {
    Alert.alert(
      `${strings.settings.logout}?`,
      null,
      [
        { text: strings.common.cancel, style: 'cancel' },
        { text: strings.settings.logout, onPress: () => logout(this.props.navigation), style: 'destructive' }
      ]
    )
  }

  render() {
    const { privateByDefault, unreadByDefault, markAsRead, openLinksExternal, readerMode, exactDate, sortTags } = this.state
    return (
      <SafeAreaView style={s.safeArea} forceInset={{ bottom: 'never' }}>
        <ScrollView
          contentContainerStyle={s.container}
          style={s.list}
        >
          <HeaderCell
            text={strings.settings.general}
            style={{ marginTop: padding.medium }}
          />
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.settings.privateByDefault}</Text>
            <Switch
              onValueChange={this.onPrivateByDefault}
              value={privateByDefault}
            />
          </View>
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.settings.unreadByDefault}</Text>
            <Switch
              onValueChange={this.onUnreadByDefault}
              value={unreadByDefault}
            />
          </View>
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.settings.markAsReadWhenOpened}</Text>
            <Switch
              onValueChange={this.onMarkAsRead}
              value={markAsRead}
            />
          </View>
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.settings.openLinksExternal}</Text>
            <Switch
              onValueChange={this.onOpenLinksExternal}
              value={openLinksExternal}
            />
          </View>
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.settings.readerMode}</Text>
            <Switch
              onValueChange={this.onReaderMode}
              value={readerMode}
            />
          </View>
          <Separator />
          <HeaderCell
            text={strings.settings.display}
            style={{ marginTop: padding.medium }}
          />
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.settings.exactDates}</Text>
            <Switch
              onValueChange={this.onExactDate}
              value={exactDate}
            />
          </View>
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.settings.sortTagsAlphabetically}</Text>
            <Switch
              onValueChange={this.onSortTags}
              value={sortTags}
            />
          </View>
          <Separator />
          <HeaderCell
            text={strings.settings.other}
            style={{ marginTop: padding.medium }}
          />
          <Separator />
          <View style={s.cell}>
            <Text style={s.text}>{strings.settings.version}</Text>
            <Text style={s.secondary}>2.0.0</Text>
          </View>
          <Separator />
          <TouchableOpacity
            activeOpacity={0.5}
            style={s.cell}
            onPress={() => this.logout()}
          >
            <Text style={s.text}>{strings.settings.logout}</Text>
          </TouchableOpacity>
          <Separator />
        </ScrollView>
      </SafeAreaView>
    )
  }
}

SettingsView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: color.white,
  },
  container: {
    paddingBottom: padding.large,
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
  secondary: {
    color: color.gray3,
    fontSize: font.medium,
    paddingRight: padding.medium,
  },
  header: {
    color: color.gray4,
    fontSize: font.large,
    fontWeight: font.bold,
    paddingHorizontal: padding.medium,
  },
  version: {
    fontSize: font.small,
    color: color.gray3,
    paddingVertical: padding.large,
    paddingHorizontal: padding.medium,
  },
})
