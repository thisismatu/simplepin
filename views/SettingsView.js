import React from 'react'
import { SafeAreaView, StyleSheet, Text, View, Switch, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native'
import PropTypes from 'prop-types'
import Storage from 'app/util/Storage'
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
    }
  }

  componentDidMount() {
    Storage.userPreferences().then((prefs) => this.setState(prefs))
  }

  onMarkAsRead = (value) => {
    Storage.setMarkAsRead(value)
    this.setState({ markAsRead: value })
  }

  onExactDate = (value) => {
    Storage.setExactDate(value)
    this.setState({ exactDate: value })
  }

  onTagOrder = (value) => {
    Storage.setTagOrder(value)
    this.setState({ tagOrder: value })
  }

  onPrivateByDefault = (value) => {
    Storage.setPrivateByDefault(value)
    this.setState({ privateByDefault: value })
  }

  onUnreadByDefault = (value) => {
    Storage.setUnreadByDefault(value)
    this.setState({ unreadByDefault: value })
  }

  onOpenLinksExternal = (value) => {
    Storage.setOpenLinksExternal(value)
    this.setState({ openLinksExternal: value })
  }

  logout = () => {
    Alert.alert(
      strings.settings.logout + '?',
      null,
      [
        { text: strings.common.cancel, style: 'cancel' },
        { text: strings.settings.logout, onPress: () => {
          Storage.clear()
          this.props.navigation.navigate('AuthLoading')
        }, style: 'destructive' },
      ]
    )
  }

  render() {
    const track = isAndroid ? color.blue2 + '88' : color.blue2
    const thumb = (isEnabled) => isAndroid && isEnabled ? color.blue2 : null
    return (
      <ScrollView
        contentContainerStyle={s.container}
        contentInsetAdjustmentBehavior="always"
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
            thumbColor={thumb(this.state.privateByDefault)}
            trackColor={{ true: track }}
            onValueChange={this.onPrivateByDefault}
            value={this.state.privateByDefault}
          />
        </View>
        <Separator />
        <View style={s.cell}>
          <Text style={s.text}>{strings.settings.unreadByDefault}</Text>
          <Switch
            style={s.switch}
            thumbColor={thumb(this.state.unreadByDefault)}
            trackColor={{ true: track }}
            onValueChange={this.onUnreadByDefault}
            value={this.state.unreadByDefault}
          />
        </View>
        <Separator />
        <View style={s.cell}>
          <Text style={s.text}>{strings.settings.markAsReadWhenOpened}</Text>
          <Switch
            style={s.switch}
            thumbColor={thumb(this.state.markAsRead)}
            trackColor={{ true: track }}
            onValueChange={this.onMarkAsRead}
            value={this.state.markAsRead}
          />
        </View>
        <Separator />
        <View style={s.cell}>
          <Text style={s.text}>{strings.settings.openLinksExternal}</Text>
          <Switch
            style={s.switch}
            thumbColor={thumb(this.state.openLinksExternal)}
            trackColor={{ true: track }}
            onValueChange={this.onOpenLinksExternal}
            value={this.state.openLinksExternal}
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
            thumbColor={thumb(this.state.exactDate)}
            trackColor={{ true: track }}
            onValueChange={this.onExactDate}
            value={this.state.exactDate}
          />
        </View>
        <Separator />
        <View style={s.cell}>
          <Text style={s.text}>{strings.settings.sortTagsAlphabetically}</Text>
          <Switch
            style={s.switch}
            thumbColor={thumb(this.state.tagOrder)}
            trackColor={{ true: track }}
            onValueChange={this.onTagOrder}
            value={this.state.tagOrder}
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
