import React from 'react'
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PropTypes from 'prop-types'
import Tag from './Tag'
import TimeAgo from './TimeAgo'
import { color, padding, font, line, icons } from '../style/style'

export default class PostCell extends React.PureComponent {
  renderTag = (tag, index) => {
    const firstTagStyle = index === 0 ? { marginLeft: 20 } : null
    return <Tag
      tag={tag}
      onPress={this.props.onTagPress}
      style={firstTagStyle}
    />
  }

  render() {
    const { post, tagOrder, exactDate, onCellPress, onCellLongPress } = this.props
    const tags = post.tags && tagOrder ? post.tags.sort() : post.tags
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => onCellPress(post)}
        onLongPress={() => onCellLongPress(post)}
      >
        {!!post.toread && <View style={s.unread} />}
        <Text style={[s.title, post.toread && s.titleUnread]}>{post.description}</Text>
        {!!post.extended && <Text style={s.description}>{post.extended}</Text>}
        <FlatList
          bounces={false}
          data={tags}
          horizontal={true}
          keyExtractor={index => index.toString()}
          ListEmptyComponent={() => <View style={s.emptyTagList} />}
          renderItem={({ item, index }) => this.renderTag(item, index)}
          showsHorizontalScrollIndicator={false}
        />
        <TimeAgo
          style={s.time}
          time={post.time}
          exactDate={exactDate}
        />
        <View style={s.statusContainer}>
          {!!post.starred && <Image source={icons.starredSmall} style={s.icon} />}
          {!post.shared ? <Image source={icons.privateSmall} style={s.icon} /> : null}
        </View>
      </TouchableOpacity>
    )
  }
}

PostCell.propTypes = {
  onTagPress: PropTypes.func.isRequired,
  onCellPress: PropTypes.func.isRequired,
  onCellLongPress: PropTypes.func.isRequired,
  exactDate: PropTypes.bool.isRequired,
  tagOrder: PropTypes.bool.isRequired,
  post: PropTypes.shape({
    description: PropTypes.string.isRequired,
    extended: PropTypes.string,
    hash: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    meta: PropTypes.string.isRequired,
    shared: PropTypes.bool.isRequired,
    starred: PropTypes.bool,
    tags: PropTypes.array,
    time: PropTypes.object.isRequired,
    toread: PropTypes.bool.isRequired,
  }),
}

const s = StyleSheet.create({
  unread: {
    backgroundColor: color.blue2,
    borderRadius: 5,
    height: 9,
    left: 8,
    position: 'absolute',
    top: 19,
    width: 9,
  },
  icon: {
    height: 18,
    tintColor: color.black36,
    width: 18,
    marginLeft: 4,
    resizeMode: 'contain',
  },
  statusContainer: {
    bottom: 13,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 18,
    position: 'absolute',
    right: padding.medium,
    width: 40,
  },
  title: {
    color: color.gray4,
    fontSize: font.large,
    lineHeight: line.large,
    paddingTop: 12,
    paddingLeft: padding.large,
    paddingRight: padding.medium,
  },
  titleUnread: {
    fontWeight: font.bold,
  },
  description: {
    color: color.gray3,
    fontSize: font.medium,
    lineHeight: line.medium,
    paddingTop: padding.tiny,
    paddingLeft: padding.large,
    paddingRight: padding.medium,
  },
  time: {
    color: color.gray3,
    fontSize: font.medium,
    lineHeight: line.medium,
    paddingBottom: 12,
    paddingLeft: padding.large,
    paddingRight: padding.medium,
  },
  emptyTagList: {
    height: 4,
  },
})
