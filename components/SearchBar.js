import React from 'react'
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Image } from 'react-native'
import PropTypes from 'prop-types'
import Base from 'app/style/Base'
import Icons from 'app/style/Icons'
import Strings from 'app/style/Strings'

export default class SearchBar extends React.PureComponent {
  render() {
    const { isSearchActive, searchQuery, onSearchChange, count } = this.props
    const icon = isSearchActive ? Icons.closeSmall : Icons.searchSmall
    return (
      <View style={styles.container}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          enablesReturnKeyAutomatically={true}
          onChange={onSearchChange}
          placeholder={Strings.common.search}
          placeholderTextColor = {Base.color.gray2}
          returnKeyType="search"
          style={styles.textField}
          underlineColorAndroid="transparent"
          value={searchQuery}
        />
        { isSearchActive > 0 ? <Text style={styles.count}>{count}</Text> : null }
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => onSearchChange('')}
          style={styles.button}
          disabled={!searchQuery}
        >
          <Image source={icon} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  }
}

SearchBar.propTypes = {
  isSearchActive: PropTypes.bool.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  count: PropTypes.number,
}

const barHeight = Base.row.tiny
const horizontalMargin = 12
const iconSize = 18

const styles = StyleSheet.create({
  container: {
    backgroundColor: Base.color.white,
    paddingBottom: Base.padding.tiny,
    paddingHorizontal: horizontalMargin,
  },
  textField: {
    backgroundColor: Base.color.gray0,
    borderRadius: 100,
    color: Base.color.gray4,
    height: barHeight,
    paddingHorizontal: Base.padding.medium,
  },
  count: {
    color: Base.color.black36,
    fontSize: Base.font.small,
    lineHeight: barHeight,
    position: 'absolute',
    top: 0,
    right: horizontalMargin + barHeight,
    textAlign: 'right',
  },
  button: {
    height: barHeight,
    padding: (barHeight - iconSize) / 2,
    position: 'absolute',
    right: horizontalMargin,
    top: 0,
    width: barHeight,
  },
  icon: {
    marginLeft: - horizontalMargin / 4,
    tintColor: Base.color.black36,
  },
})
