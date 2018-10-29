import React from 'react'
import {StyleSheet, Text, Image, View, TouchableOpacity, ScrollView, AsyncStorage} from 'react-native'
import Storage from 'app/util/Storage'
import {colors, padding, fonts} from 'app/assets/base'
import strings from 'app/assets/strings'

const listSections = [
  {title: strings.menu.bookmarks, data: [strings.menu.all, strings.menu.unread, strings.menu.public, strings.menu.private]},
  {title: strings.common.simplepin, data: [strings.menu.settings, strings.menu.feedback, strings.menu.rate, strings.menu.logout]},
]

const ListItem = ({text, secondary, func}) => {
  return(
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={() => func()}
    >
      <Text style={styles.itemText}>{text}</Text>
      <Text style={styles.itemSecondaryText}>{secondary}</Text>
    </TouchableOpacity>
  )
}

export default class MenuView extends React.Component {
  static navigationOptions = ({navigation}) => {
    console.log(navigation)
    return {
      title: strings.common.simplepin,
      headerLeft: (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.dismiss()}
        >
          <Image source={require('app/assets/ic-close.png')} style={styles.menu} />
        </TouchableOpacity>
      )
    }
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.item}>
          <Text style={[styles.header, styles.itemText]}>{strings.menu.bookmarks}</Text>
        </View>
        <ListItem
          text={strings.menu.all}
          secondary={263}
          func={() => this.props.navigation.navigate('List', {type: 1})}
        />
        <ListItem
          text={strings.menu.unread}
          secondary={63}
          func={() => this.props.navigation.navigate('List', {type: 2})}
        />
        <ListItem
          text={strings.menu.public}
          secondary={187}
          func={() => this.props.navigation.navigate('List', {type: 3})}
        />
        <ListItem
          text={strings.menu.private}
          secondary={13}
          func={() => this.props.navigation.navigate('List', {type: 4})}
        />
        <View style={styles.item}>
          <Text style={[styles.header, styles.itemText]}>{strings.common.simplepin}</Text>
        </View>
        <ListItem
          text={strings.menu.settings}
          secondary={null}
          func={() => console.log(strings.menu.settings)}
        />
        <ListItem
          text={strings.menu.feedback}
          secondary={null}
          func={() => console.log(strings.menu.feedback)}
        />
        <ListItem
          text={strings.menu.rate}
          secondary={null}
          func={() => console.log(strings.menu.rate)}
        />
        <ListItem
          text={strings.menu.logout}
          secondary={null}
          func={() => console.log(strings.menu.logout)}
        />
        <Text style={styles.version}>{strings.common.simplepin} v. XXXX</Text>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: padding.medium,
  },
  menu: {
    marginHorizontal: 12,
    marginVertical: 8,
    tintColor: colors.blue2,
  },
  item: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: padding.medium,
  },
  itemText: {
    color: colors.gray4,
    fontSize: fonts.large,
    lineHeight: 16,
  },
  itemSecondaryText: {
    color: colors.gray3,
    lineHeight: 16,
    fontSize: fonts.medium,
  },
  header: {
    fontWeight: fonts.bold,
    lineHeight: 16,
    marginTop: padding.medium,
  },
  version: {
    fontSize: fonts.small,
    color: colors.gray3,
    paddingVertical: padding.large
  }
})