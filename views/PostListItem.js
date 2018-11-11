import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import {StyleSheet, Text, Image, View, TouchableOpacity, FlatList} from 'react-native'
import Base from 'app/assets/Base'

const TagItem = ({item}) => {
  const isPrivateTag = _.startsWith(item, '.')
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

export default class PostListItem extends React.Component {
  shouldComponentUpdate (nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)
  }

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
        {
          !this.props.item.shared
          ? <Image source={require('app/assets/ic-lock.png')} style={styles.private} />
          : null
        }
        <Text style={[styles.title, this.props.item.toread && styles.titleUnread]}>{this.props.item.description}</Text>
        {
          this.props.item.extended
          ? <Text style={styles.description}>{_.trim(this.props.item.extended)}</Text>
          : null
        }
        <FlatList
          bounces={false}
          data={this.props.item.tags}
          horizontal={true}
          keyExtractor={(item, index) => _.toString(index)}
          ListEmptyComponent={() => <View style={styles.emptyTagList} />}
          renderItem={({item}) => <TagItem item={item} />}
          showsHorizontalScrollIndicator={false}
          style={styles.tagList}
        />
        <Text style={styles.time}>{this.props.item.time.toLocaleDateString()}</Text>
        <View style={styles.separator} />
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
  separator: {
    backgroundColor: 'white',
    borderTopColor: Base.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderStyle: 'solid',
    height: 1,
    marginLeft: Base.padding.large,
    marginRight: Base.padding.medium,
  },
  unread: {
    backgroundColor: Base.colors.blue2,
    borderRadius: 5,
    height: 9,
    left: 8,
    position: 'absolute',
    top: 20,
    width: 9,
  },
  private: {
    bottom: Base.padding.medium,
    height: 16,
    position: 'absolute',
    right: Base.padding.medium,
    tintColor: Base.colors.gray2,
    width: 16,
  },
  title: {
    color: Base.colors.gray4,
    fontSize: Base.fonts.large,
    lineHeight: 24,
    paddingTop: 12,
    paddingLeft: Base.padding.large,
    paddingRight: Base.padding.medium,
  },
  titleUnread: {
    fontWeight: Base.fonts.bold,
  },
  description: {
    color: Base.colors.gray3,
    fontSize: Base.fonts.medium,
    lineHeight: 20,
    paddingTop: Base.padding.tiny,
    paddingLeft: Base.padding.large,
    paddingRight: Base.padding.medium,
  },
  time: {
    color: Base.colors.gray3,
    fontSize: Base.fonts.medium,
    lineHeight: 20,
    paddingBottom: 14,
    paddingLeft: Base.padding.large,
    paddingRight: Base.padding.medium,
  },
  emptyTagList: {
    height: 5,
  },
  tagList: {
    marginLeft: Base.padding.large,
    overflow: 'visible',
  },
  tagContainer: {
    marginRight: Base.padding.small,
    paddingVertical: Base.padding.small,
  },
  tag: {
    backgroundColor: Base.colors.blue1,
    borderRadius: Base.radius.small,
    paddingHorizontal: Base.padding.small,
    paddingVertical: Base.padding.tiny,
  },
  tagText: {
    color: Base.colors.blue2,
    lineHeight: 16,
  },
  privateTag: {
    backgroundColor: Base.colors.gray1,
  },
  privateTagText: {
    color: Base.colors.gray3,
  },
})
