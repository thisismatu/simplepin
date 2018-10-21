import React from 'react'
import {StyleSheet, FlatList} from 'react-native'
import {colors} from 'app/assets/base'
import ListItemView from 'app/views/ListItemView'
import strings from 'app/assets/strings'

import {mockData} from 'app/mockData'

export default class WelcomeView extends React.Component {
  static navigationOptions = {
    title: strings.common.simplepin
  }

  render() {
    return (
      <FlatList
        style={styles.container}
        data={mockData}
        renderItem={({item}) => <ListItemView post={item} />}
        keyExtractor={(item, index) => index.toString()}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  }
})