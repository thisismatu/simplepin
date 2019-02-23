import React from 'react'
import { StyleSheet, Text, View, Switch, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native'
import PropTypes from 'prop-types'
import Storage from 'app/Storage'
import { logout } from 'app/util/ErrorUtil'
import NavigationButton from 'app/components/NavigationButton'
import HeaderCell from 'app/components/HeaderCell'
import Separator from 'app/components/Separator'
import { color, padding, font, row, icons } from 'app/style/style'
import strings from 'app/style/strings'

const isAndroid = Platform.OS === 'android'
const { expo } = require('app/app.json')

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
      tagOrder: false,
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

  onTagOrder = value => {
    Storage.setTagOrder(value)
    this.setState({ tagOrder: value })
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
      strings.settings.logout + '?',
      null,
      [
        { text: strings.common.cancel, style: 'cancel' },
        { text: strings.settings.logout, onPress: () => logout(this.props.navigation), style: 'destructive' },
      ]
    )
  }

  render() {
    const { privateByDefault, unreadByDefault, markAsRead, openLinksExternal, readerMode, exactDate, tagOrder } = this.state
    const track = isAndroid ? color.blue2 + '88' : color.blue2
    const thumb = isEnabled => isAndroid && isEnabled && color.blue2
    return (
      <ScrollView
        contentContainerStyle={s.container}
        contentInsetAdjustmentBehavior="always"
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
            style={s.switch}
            thumbColor={thumb(privateByDefault)}
            trackColor={{ true: track }}
            onValueChange={this.onPrivateByDefault}
            value={privateByDefault}
          />
        </View>
        <Separator />
        <View style={s.cell}>
          <Text style={s.text}>{strings.settings.unreadByDefault}</Text>
          <Switch
            style={s.switch}
            thumbColor={thumb(unreadByDefault)}
            trackColor={{ true: track }}
            onValueChange={this.onUnreadByDefault}
            value={unreadByDefault}
          />
        </View>
        <Separator />
        <View style={s.cell}>
          <Text style={s.text}>{strings.settings.markAsReadWhenOpened}</Text>
          <Switch
            style={s.switch}
            thumbColor={thumb(markAsRead)}
            trackColor={{ true: track }}
            onValueChange={this.onMarkAsRead}
            value={markAsRead}
          />
        </View>
        <Separator />
        <View style={s.cell}>
          <Text style={s.text}>{strings.settings.openLinksExternal}</Text>
          <Switch
            style={s.switch}
            thumbColor={thumb(openLinksExternal)}
            trackColor={{ true: track }}
            onValueChange={this.onOpenLinksExternal}
            value={openLinksExternal}
          />
        </View>
        <Separator />
        <View style={s.cell}>
          <Text style={s.text}>{strings.settings.readerMode}</Text>
          <Switch
            style={s.switch}
            thumbColor={thumb(readerMode)}
            trackColor={{ true: track }}
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
            style={s.switch}
            thumbColor={thumb(exactDate)}
            trackColor={{ true: track }}
            onValueChange={this.onExactDate}
            value={exactDate}
          />
        </View>
        <Separator />
        <View style={s.cell}>
          <Text style={s.text}>{strings.settings.sortTagsAlphabetically}</Text>
          <Switch
            style={s.switch}
            thumbColor={thumb(tagOrder)}
            trackColor={{ true: track }}
            onValueChange={this.onTagOrder}
            value={tagOrder}
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
          <Text style={s.secondary}>{expo.version}</Text>
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
    )
  }
}

SettingsView.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const s = StyleSheet.create({
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
  switch: {
    marginRight: isAndroid ? 12 : padding.medium,
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
