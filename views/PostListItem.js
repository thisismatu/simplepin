import React from 'react'
import {StyleSheet, Text, Image, View, TouchableOpacity, FlatList} from 'react-native'
import {colors, fonts, padding, radius} from 'app/assets/base'

const TagItem = ({tag}) => {
  const isPrivateTag = tag.charAt(0) === '.'
  return(
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.tagContainer}
      onPress={() => console.log(tag)}
    >
      <View style={[styles.tag, isPrivateTag && styles.privateTag]}>
        <Text style={[styles.tagText, isPrivateTag && styles.privateTagText]}>{tag}</Text>
      </View>
    </TouchableOpacity>
  )
}

// export default class PostListItem extends React.Component {
//   static propTypes = {

//   }
// }

export default PostListItem = ({post}) => {
  const tags = post.tags != '' ? post.tags.split(' ') : null
  const date = new Date(post.time).toLocaleDateString()

  return (
    <TouchableOpacity
      activeOpacity={0.7}
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
          data={tags}
          horizontal={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => <TagItem tag={item} />}
          showsHorizontalScrollIndicator={false}
          style={[styles.tagList, !tags && styles.spacer]}
        />
        <Text style={styles.time}>{date}</Text>
      </View>
      {
        !post.shared
        ? <Image source={require('app/assets/ic_lock.png')} style={styles.private} />
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
    paddingLeft: padding.large,
    paddingRight: padding.medium,
    paddingVertical: 12,
  },
  border: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: padding.large,
    marginRight: padding.medium,
  },
  spacer: {
    height: padding.tiny,
  },
  unread: {
    backgroundColor: colors.blue2,
    borderRadius: 5,
    height: 9,
    left: 8,
    position: 'absolute',
    top: 20,
    width: 9,
  },
  private: {
    bottom: padding.medium,
    height: 16,
    position: 'absolute',
    right: padding.medium,
    tintColor: colors.gray2,
    width: 16,
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
    width: '100%',
  },
  tagContainer: {
    marginRight: padding.small,
    paddingVertical: padding.small,
  },
  tag: {
    backgroundColor: colors.blue1,
    borderRadius: radius.small,
    paddingHorizontal: padding.small,
    paddingVertical: padding.tiny,
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
  },
})