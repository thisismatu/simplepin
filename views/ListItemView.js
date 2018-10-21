import React from 'react'
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native'
import {colors, fonts, padding, radius} from 'app/assets/base'

export default ListItem = ({post}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => console.log(post.description)}
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
        {
          post.tags
          ? <TouchableOpacity
              activeOpacity={0.5}
              style={styles.tagContainer}
              onPress={() => console.log(post.tags)}
            >
              <View style={styles.tag}>
                <Text style={styles.tagText}>{post.tags}</Text>
              </View>
            </TouchableOpacity>
          : <View style={styles.spacer} />
        }
        <Text style={styles.time}>{post.time}</Text>
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
  tagContainer: {
    paddingVertical: padding.small,
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
  }
})