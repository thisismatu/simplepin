import React from 'react'
import {StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native'
import {colors, fonts, padding, radius} from 'app/assets/base'

const TagItem = ({tag}) => {
  const isPrivateTag = tag.charAt(0) === '.'
  return(
    <TouchableOpacity
      activeOpacity={0.5}
      style={styles.tagContainer}
      onPress={() => console.log(tag)}
    >
      <View style={[styles.tag, isPrivateTag && styles.privateTag]}>
        <Text style={[styles.tagText, isPrivateTag && styles.privateTagText]}>{tag}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default ListItem = ({post}) => {
  const tags = post.tags != '' ? post.tags.split(' ') : null
  const date = new Date(post.time).toLocaleDateString()

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => console.log(post)}
    >
      {
        post.toread
        ? <View style={styles.unread} />
        : null
      }
      <View style={styles.post}>
        <Text style={[styles.title, post.toread && styles.titleUnread]}>{post.description}</Text>
        {
          post.extended
          ? <Text style={styles.description}>{post.extended.trim()}</Text>
          : null
        }
        <FlatList
          style={[styles.tagList, !tags && styles.spacer]}
          data={tags}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => <TagItem tag={item} />}
          keyExtractor={(item, index) => index.toString()}
          horizontal={true}
        />
        <Text style={styles.time}>{date}</Text>
      </View>
      {
        !post.shared
        ? <View style={styles.private} />
        : null
      }
      <View style={styles.border} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  post: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingRight: padding.medium,
    paddingLeft: padding.large,
  },
  border: {
    borderBottomColor: colors.gray1,
    borderBottomWidth: 1,
    marginRight: padding.medium,
    marginLeft: padding.large,
  },
  spacer: {
    height: padding.tiny,
  },
  unread: {
    position: 'absolute',
    top: 20,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: radius.medium,
    backgroundColor: colors.blue2,
  },
  private: {
    position: 'absolute',
    bottom: padding.medium,
    right: padding.medium,
    width: 16,
    height: 16,
    borderRadius: radius.small,
    backgroundColor: colors.gray2,
  },
  title: {
    color: colors.gray4,
    fontSize: fonts.large,
    lineHeight: 24,
  },
  titleUnread: {
    fontWeight: fonts.bold,
  },
  description: {
    color: colors.gray3,
    fontSize: fonts.medium,
    lineHeight: 20,
    marginTop: padding.tiny,
  },
  time: {
    color: colors.gray3,
    fontSize: fonts.medium,
    lineHeight: 20,
  },
  tagList: {
    width: '100%'
  },
  tagContainer: {
    paddingVertical: padding.small,
    marginRight: padding.small
  },
  tag: {
    backgroundColor: colors.blue1,
    paddingHorizontal: padding.small,
    paddingVertical: padding.tiny,
    borderRadius: radius.small,
  },
  tagText: {
    color: colors.blue2,
    lineHeight: 16,
  },
  privateTag: {
    backgroundColor: colors.gray1,
  },
  privateTagText: {
    color: colors.gray3,
  }
})