import React from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, Text, Image, View, TouchableOpacity, FlatList} from 'react-native'
import {colors, fonts, padding, radius} from 'app/assets/base'

const TagItem = ({item}) => {
  const isPrivateTag = item.charAt(0) === '.'
  return(
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.tagContainer}
      onPress={() => console.log(item)}
    >
      <View style={[styles.tag, isPrivateTag && styles.privateTag]}>
        <Text style={[styles.tagText, isPrivateTag && styles.privateTagText]}>{item}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default class PostListItem extends React.PureComponent {
  render() {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => console.log(this.props.item)}
      >
        {
          this.props.item.toread
          ? <View style={styles.unread} />
          : null
        }
        <View style={styles.post}>
          <Text style={[styles.title, this.props.item.toread && styles.titleUnread]}>{this.props.item.description}</Text>
          {
            this.props.item.extended
            ? <Text style={styles.description}>{this.props.item.extended.trim()}</Text>
            : null
          }
          <FlatList
            data={this.props.item.tags}
            horizontal={true}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={() => <View style={styles.emptyTagList} />}
            renderItem={({item}) => <TagItem item={item} />}
            showsHorizontalScrollIndicator={false}
            style={styles.tagList}
          />
          <Text style={styles.time}>{this.props.item.time.toLocaleDateString()}</Text>
        </View>
        {
          !this.props.item.shared
          ? <Image source={require('app/assets/ic-lock.png')} style={styles.private} />
          : null
        }
        <View style={styles.border} />
      </TouchableOpacity>
    )
  }
}

PostListItem.propTypes = {
  item: PropTypes.shape({
    description: PropTypes.string.isRequired,
    extended: PropTypes.string,
    hash: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    meta: PropTypes.string.isRequired,
    shared: PropTypes.bool.isRequired,
    tags: PropTypes.array,
    time: PropTypes.object.isRequired,
    toread: PropTypes.bool.isRequired,
  })
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
  emptyTagList: {
    height: 5,
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