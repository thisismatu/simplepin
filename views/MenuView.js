import React from 'react'
import {StyleSheet, Text, Image, View, TouchableOpacity, ScrollView, AsyncStorage, SafeAreaView} from 'react-native'
import Storage from 'app/util/Storage'
import {colors, padding, fonts} from 'app/assets/base'
import strings from 'app/assets/strings'

const listSections = [
  {title: strings.menu.bookmarks, data: [strings.menu.all, strings.menu.unread, strings.menu.public, strings.menu.private]},
  {title: strings.common.simplepin, data: [strings.menu.settings, strings.menu.feedback, strings.menu.rate, strings.menu.logout]},
]

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
      <SafeAreaView>
        <ScrollView style={styles.container}>
          <View style={styles.item}>
            <Text style={[styles.header, styles.itemText]}>{strings.menu.bookmarks}</Text>
          </View>
          <TouchableOpacity
            style={styles.item}
            activeOpacity={0.7}
            onPress={() => this.props.navigation.navigate('List', {type: 1})}
          >
            <Text style={styles.itemText}>{strings.menu.all}</Text>
            <Text style={styles.itemSecondaryText}>{263}</Text>
          </TouchableOpacity>
          <View style={styles.item}>
            <Text style={[styles.header, styles.itemText]}>{strings.common.simplepin}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemText}>{strings.menu.settings}</Text>
          </View>
          <Text style={styles.version}>{strings.common.simplepin} v. XXXX</Text>
        </ScrollView>
      </SafeAreaView>
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