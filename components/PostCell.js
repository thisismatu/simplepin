import React from 'react'
import { StyleSheet, Text, Image, View, TouchableOpacity, FlatList } from 'react-native'
import PropTypes from 'prop-types'
import startsWith from 'lodash/startsWith'
import isEqual from 'lodash/isEqual'
import TimeAgo from 'app/components/TimeAgo'
import Base from 'app/style/Base'
import Icons from 'app/style/Icons'

class Tag extends React.PureComponent {
  render() {
    const { tag, index, onTagPress } = this.props
    const isPrivateTag = startsWith(tag, '.')
    return(
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={onTagPress(tag)}
        style={[styles.tagContainer, index === 0 && styles.firstTag]}
      >
        <View style={[styles.tag, isPrivateTag && styles.privateTag]}>
          <Text style={[styles.tagText, isPrivateTag && styles.privateTagText]}>{tag}</Text>
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
          ? <View style={styles.unread} />
          : null
        }
        <Text style={[styles.title, post.toread && styles.titleUnread]}>{post.description}</Text>
        {
          post.extended
          ? <Text style={styles.description}>{post.extended}</Text>
          : null
        }
        <FlatList
          bounces={false}
          data={tags}
          horizontal={true}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={() => <View style={styles.emptyTagList} />}
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
          style={styles.time}
          time={post.time}
          exactDate={exactDate}
        />
        <View style={styles.statusContainer}>
          { post.starred ? <Image source={Icons.starredSmall} style={styles.starred} /> : null }
          { !post.shared ? <Image source={Icons.privateSmall} style={styles.private} /> : null }
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

const styles = StyleSheet.create({
  unread: {
    backgroundColor: Base.color.blue2,
    borderRadius: 5,
    height: 9,
    left: 8,
    position: 'absolute',
    top: 19,
    width: 9,
  },
  private: {
    height: 18,
    tintColor: Base.color.black36,
    width: 18,
    marginLeft: 2,
  },
  starred: {
    height: 18,
    tintColor: Base.color.black36,
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
    color: Base.color.gray4,
    fontSize: Base.font.large,
    lineHeight: Base.line.large,
    paddingTop: 12,
    paddingLeft: Base.padding.large,
    paddingRight: Base.padding.medium,
  },
  titleUnread: {
    fontWeight: Base.font.bold,
  },
  description: {
    color: Base.color.gray3,
    fontSize: Base.font.medium,
    lineHeight: Base.line.medium,
    paddingTop: Base.padding.tiny,
    paddingLeft: Base.padding.large,
    paddingRight: Base.padding.medium,
  },
  time: {
    color: Base.color.gray3,
    fontSize: Base.font.medium,
    lineHeight: Base.line.medium,
    paddingBottom: 12,
    paddingLeft: Base.padding.large,
    paddingRight: Base.padding.medium,
  },
  emptyTagList: {
    height: 4,
  },
  firstTag: {
    marginLeft: Base.padding.large - Base.padding.tiny,
  },
  tagContainer: {
    paddingHorizontal: Base.padding.tiny,
    paddingVertical: 6,
  },
  tag: {
    backgroundColor: Base.color.blue1,
    borderRadius: Base.radius.small,
    paddingHorizontal: Base.padding.small,
    paddingVertical: Base.padding.tiny,
  },
  tagText: {
    color: Base.color.blue2,
    fontSize: Base.font.small,
    lineHeight: Base.line.small,
  },
  privateTag: {
    backgroundColor: Base.color.gray1,
  },
  privateTagText: {
    color: Base.color.gray3,
  },
})
