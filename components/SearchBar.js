import React from 'react'
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Image } from 'react-native'
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import { color, padding, font, row, icons } from 'app/style/style'
import strings from 'app/style/strings'

export default class SearchBar extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { text: null }
  }

  reset = () => this.setState({ text: null })

  setText = text => this.setState({ text })

  onChange = text => {
    this.setText(text)
    this.props.onSearchChange(text)
  }

  onClear = () => {
    this.reset()
    this.props.onClearSearch()
  }

  render() {
    const { text } = this.state
    const isSearchActive = !isEmpty(text)
    const icon = isSearchActive ? icons.closeSmall : icons.searchSmall
    return (
      <View style={s.container}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          enablesReturnKeyAutomatically={true}
          onChangeText={this.onChange}
          placeholder={strings.common.search}
          placeholderTextColor = {color.gray2}
          returnKeyType="done"
          style={s.textField}
          underlineColorAndroid="transparent"
          value={text}
        />
        {isSearchActive && <Text style={s.matches}>{this.props.matches}</Text>}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={this.onClear}
          style={s.button}
          disabled={!text}
        >
          <Image source={icon} style={s.icon} />
        </TouchableOpacity>
      </View>
    )
  }
}

SearchBar.propTypes = {
  onSearchChange: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func.isRequired,
  matches: PropTypes.number,
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
  matches: {
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
