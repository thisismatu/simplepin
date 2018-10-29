import React from 'react'
import {StyleSheet, Text, Image, View, TouchableOpacity, SectionList, AsyncStorage} from 'react-native'
import Storage from 'app/util/Storage'
import {colors} from 'app/assets/base'
import strings from 'app/assets/strings'

const listSections = [
  {title: strings.menu.bookmarks, data: [strings.menu.all, strings.menu.unread, strings.menu.public, strings.menu.private]},
  {title: strings.common.simplepin, data: [strings.menu.settings, strings.menu.feedback, strings.menu.rate, strings.menu.logout]},
]

export default class MenuView extends React.Component {
  static navigationOptions = {
    title: strings.common.simplepin,
  }

  render() {
    return (
      <SectionList
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index, section}) => <Text key={index}>{item}</Text>}
        renderSectionHeader={({section: {title}}) => <Text style={{fontWeight: 'bold'}}>{title}</Text>}
        style={styles.container}
        sections={listSections}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  }
})