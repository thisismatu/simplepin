import React from 'react'
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Image } from 'react-native'
import PropTypes from 'prop-types'
import { color, padding, font, row, icons } from 'app/style/style'
import strings from 'app/style/strings'

export default class SearchBar extends React.PureComponent {
  render() {
    const { isSearchActive, searchQuery, onSearchChange, count } = this.props
    const icon = isSearchActive ? icons.closeSmall : icons.searchSmall
    return (
      <View style={s.container}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          enablesReturnKeyAutomatically={true}
          onChange={onSearchChange}
          placeholder={strings.common.search}
          placeholderTextColor = {color.gray2}
          returnKeyType="done"
          style={s.textField}
          underlineColorAndroid="transparent"
          value={searchQuery}
        />
        {isSearchActive > 0 && <Text style={s.count}>{count}</Text>}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => onSearchChange('')}
          style={s.button}
          disabled={!searchQuery}
        >
          <Image source={icon} style={s.icon} />
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

const barHeight = row.tiny
const horizontalMargin = 12
const iconSize = 18

const s = StyleSheet.create({
  container: {
    backgroundColor: color.white,
    paddingBottom: padding.tiny,
    paddingHorizontal: horizontalMargin,
  },
  textField: {
    backgroundColor: color.gray0,
    borderRadius: 100,
    color: color.gray4,
    height: barHeight,
    paddingHorizontal: padding.medium,
  },
  count: {
    color: color.black36,
    fontSize: font.small,
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
    tintColor: color.black36,
    resizeMode: 'contain',
  },
})
