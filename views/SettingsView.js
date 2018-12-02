import React from 'react'
import { StyleSheet, Text, View, Switch, ScrollView, Platform } from 'react-native'
import Storage from 'app/util/Storage'
import MenuButton from 'app/components/MenuButton'
import HeaderCell from 'app/components/HeaderCell'
import Separator from 'app/components/Separator'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

const isAndroid = Platform.OS === 'android'

export default class SetingsView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: Strings.settings.title,
      headerLeft: <MenuButton onPress={() => navigation.openDrawer()} />,
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      markAsRead: false,
      exactDate: false,
      tagOrder: false,
    }
  }

  componentDidMount() {
    Storage.userPreferences().then((value) => {
      this.setState(value)
    })
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

  render() {
    const track = isAndroid ? Base.color.blue2 + '88' : Base.color.blue2
    const thumb = (isEnabled) => isAndroid && isEnabled ? Base.color.blue2 : null

    return (
      <ScrollView style={styles.container}>
        <HeaderCell text={Strings.settings.general} />
        <Separator />
        <View style={styles.cell}>
          <Text style={styles.text}>{Strings.settings.privateByDefault}</Text>
          <Switch
            style={styles.switch}
            trackColor={{ true: track }}
          />
        </View>
        <Separator />
        <View style={styles.cell}>
          <Text style={styles.text}>{Strings.settings.unreadByDefault}</Text>
          <Switch
            style={styles.switch}
            trackColor={{ true: track }}
          />
        </View>
        <Separator />
        <View style={styles.cell}>
          <Text style={styles.text}>{Strings.settings.markAsReadWhenOpened}</Text>
          <Switch
            style={styles.switch}
            thumbColor={thumb(this.state.markAsRead)}
            trackColor={{ true: track }}
            onValueChange={this.onMarkAsRead}
            value={this.state.markAsRead}
          />
        </View>
        <Separator />

        <HeaderCell text={Strings.settings.browser} />
        <Separator />
        <View style={styles.cell}>
          <Text style={styles.text}>{Strings.settings.defaultBrowser}</Text>
          <Text style={styles.secondary}>Browser</Text>
        </View>
        <Separator />
        <View style={styles.cell}>
          <Text style={styles.text}>{Strings.settings.openLinksInDefaultBrowser}</Text>
          <Switch
            style={styles.switch}
            trackColor={{ true: track }}
          />
        </View>
        <Separator />

        <HeaderCell text={Strings.settings.display} />
        <Separator />
        <View style={styles.cell}>
          <Text style={styles.text}>{Strings.settings.exactDates}</Text>
          <Switch
            style={styles.switch}
            thumbColor={thumb(this.state.exactDate)}
            trackColor={{ true: track }}
            onValueChange={this.onExactDate}
            value={this.state.exactDate}
          />
        </View>
        <Separator />
        <View style={styles.cell}>
          <Text style={styles.text}>{Strings.settings.sortTagsAlphabetically}</Text>
          <Switch
            style={styles.switch}
            thumbColor={thumb(this.state.tagOrder)}
            trackColor={{ true: track }}
            onValueChange={this.onTagOrder}
            value={this.state.tagOrder}
          />
        </View>
        <Separator />
        <Text style={styles.version}>{Strings.common.simplepin} v. XXXX</Text>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Base.color.white,
  },
  section: {
    paddingTop: Base.padding.small,
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
  switch: {
    marginRight: isAndroid ? 12 : Base.padding.medium,
  },
  secondary: {
    color: Base.color.gray3,
    fontSize: Base.font.medium,
    paddingRight: Base.padding.medium,
  },
  header: {
    color: Base.color.gray4,
    fontSize: Base.font.large,
    fontWeight: Base.font.bold,
    paddingHorizontal: Base.padding.medium,
  },
  version: {
    fontSize: Base.font.small,
    color: Base.color.gray3,
    paddingVertical: Base.padding.large,
    paddingHorizontal: Base.padding.medium,
  },
})
