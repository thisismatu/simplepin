import React from 'react'
import { StyleSheet, Text, Image, View, TouchableOpacity, FlatList } from 'react-native'
import PropTypes from 'prop-types'
import startsWith from 'lodash/startsWith'
import TimeAgo from 'app/components/TimeAgo'
import Base from 'app/assets/Base'
import Icons from 'app/assets/Icons'

const Tag = ({ tag, index }) => {
  const isPrivateTag = startsWith(tag, '.')
  return(
    <TouchableOpacity
      activeOpacity={0.5}
      style={[styles.tagContainer, index === 0 && styles.firstTag]}
    >
      <View style={[styles.tag, isPrivateTag && styles.privateTag]}>
        <Text style={[styles.tagText, isPrivateTag && styles.privateTagText]}>{tag}</Text>
      </View>
    </TouchableOpacity>
  )
}

Tag.propTypes = {
  tag: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
}

const PostCell = (props) => {
  const tags = props.post.tags && props.tagOrder  ? props.post.tags.sort() : props.post.tags
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={props.onCellPress(props.post)}
      onLongPress={props.onCellLongPress(props.post)}
    >
      {
        props.post.toread
        ? <View style={styles.unread} />
        : null
      }
      {
        !props.post.shared
        ? <Image source={Icons.privateSmall} style={styles.private} />
        : null
      }
      <Text style={[styles.title, props.post.toread && styles.titleUnread]}>{props.post.description}</Text>
      {
        props.post.extended
        ? <Text style={styles.description}>{props.post.extended}</Text>
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
          />
        }
        showsHorizontalScrollIndicator={false}
      />
      <TimeAgo
        style={styles.time}
        time={props.post.time}
        exactDate={props.exactDate}
      />
    </TouchableOpacity>
  )
}

PostCell.propTypes = {
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
    bottom: 13,
    height: 18,
    position: 'absolute',
    right: 13,
    tintColor: Base.color.black36,
    width: 18,
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

export default PostCell
