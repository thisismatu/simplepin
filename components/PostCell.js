import React from 'react'
import { StyleSheet, Text, Image, View, TouchableOpacity, FlatList } from 'react-native'
import PropTypes from 'prop-types'
import startsWith from 'lodash/startsWith'
import TimeAgo from 'app/components/TimeAgo'
import { color, padding, font, line, radius, icons } from 'app/style/style'

class Tag extends React.PureComponent {
  render() {
    const { tag, index, onTagPress } = this.props
    const isPrivateTag = startsWith(tag, '.')
    return(
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={onTagPress(tag)}
        style={[s.tagContainer, index === 0 && s.firstTag]}
      >
        <View style={[s.tag, isPrivateTag && s.privateTag]}>
          <Text style={[s.tagText, isPrivateTag && s.privateTagText]}>{tag}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

Tag.propTypes = {
  tag: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onTagPress: PropTypes.func.isRequired,
}

export default class PostCell extends React.PureComponent {
  render() {
    const { post, tagOrder, exactDate, onTagPress, onCellPress, onCellLongPress } = this.props
    const tags = post.tags && tagOrder  ? post.tags.sort() : post.tags
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={onCellPress(post)}
        onLongPress={onCellLongPress(post)}
      >
        {
          post.toread
          ? <View style={s.unread} />
          : null
        }
        <Text style={[s.title, post.toread && s.titleUnread]}>{post.description}</Text>
        {
          post.extended
          ? <Text style={s.description}>{post.extended}</Text>
          : null
        }
        <FlatList
          bounces={false}
          data={tags}
          horizontal={true}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={() => <View style={s.emptyTagList} />}
          renderItem={({ item, index }) =>
            <Tag
              tag={item}
              index={index}
              onTagPress={onTagPress}
            />
          }
          showsHorizontalScrollIndicator={false}
        />
        <TimeAgo
          style={s.time}
          time={post.time}
          exactDate={exactDate}
        />
        <View style={s.statusContainer}>
          {!!post.starred && <Image source={icons.starredSmall} style={s.starred} />}
          {!post.shared ? <Image source={icons.privateSmall} style={s.private} /> : null}
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
  changeDetection: PropTypes.string.isRequired,
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
  private: {
    height: 18,
    tintColor: color.black36,
    width: 18,
    marginLeft: 2,
  },
  starred: {
    height: 18,
    tintColor: color.black36,
    width: 18,
    marginRight: 2,
  },
  statusContainer: {
    bottom: 13,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 18,
    position: 'absolute',
    right: 14,
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
  firstTag: {
    marginLeft: padding.large - padding.tiny,
  },
  tagContainer: {
    paddingHorizontal: padding.tiny,
    paddingVertical: 6,
  },
  tag: {
    backgroundColor: color.blue1,
    borderRadius: radius.small,
    paddingHorizontal: padding.small,
    paddingVertical: padding.tiny,
  },
  tagText: {
    color: color.blue2,
    fontSize: font.small,
    lineHeight: line.small,
  },
  privateTag: {
    backgroundColor: color.gray1,
  },
  privateTagText: {
    color: color.gray3,
  },
})
