import React from 'react'
import { StyleSheet, Text, Image, View, TouchableOpacity, FlatList } from 'react-native'
import PropTypes from 'prop-types'
import isEqual from 'lodash/isEqual'
import startsWith from 'lodash/startsWith'
import Base from 'app/assets/Base'

const Tag = ({ item, index }) => {
  const isPrivateTag = startsWith(item, '.')
  return(
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.tagContainer, index === 0 && styles.firstTag]}
      onPress={() => console.log(item)}
    >
      <View style={[styles.tag, isPrivateTag && styles.privateTag]}>
        <Text style={[styles.tagText, isPrivateTag && styles.privateTagText]}>{item}</Text>
      </View>
    </TouchableOpacity>
  )
}

Tag.propTypes = {
  item: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
}

export default class PostCell extends React.Component {
  shouldComponentUpdate (nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState)
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
          ? <Text style={styles.description}>{this.props.item.extended.trim()}</Text>
          : null
        }
        <FlatList
          bounces={false}
          data={this.props.item.tags}
          horizontal={true}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={() => <View style={styles.emptyTagList} />}
          renderItem={({ item, index }) => <Tag item={item} index={index} />}
          showsHorizontalScrollIndicator={false}
        />
        <Text style={styles.time}>{this.props.item.time.toLocaleDateString()}</Text>
      </TouchableOpacity>
    )
  }
}

PostCell.propTypes = {
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
  }),
}

const styles = StyleSheet.create({
  unread: {
    backgroundColor: Base.color.blue2,
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
    tintColor: Base.color.gray2,
    width: 16,
  },
  title: {
    color: Base.color.gray4,
    fontSize: Base.font.large,
    lineHeight: 24,
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
    lineHeight: 20,
    paddingTop: Base.padding.tiny,
    paddingLeft: Base.padding.large,
    paddingRight: Base.padding.medium,
  },
  time: {
    color: Base.color.gray3,
    fontSize: Base.font.medium,
    lineHeight: 20,
    paddingBottom: 14,
    paddingLeft: Base.padding.large,
    paddingRight: Base.padding.medium,
  },
  emptyTagList: {
    height: 5,
  },
  firstTag: {
    marginLeft: Base.padding.large - Base.padding.tiny,
  },
  tagContainer: {
    paddingHorizontal: Base.padding.tiny,
    paddingVertical: Base.padding.small,
  },
  tag: {
    backgroundColor: Base.color.blue1,
    borderRadius: Base.radius.small,
    paddingHorizontal: Base.padding.small,
    paddingVertical: Base.padding.tiny,
  },
  tagText: {
    color: Base.color.blue2,
    lineHeight: 16,
  },
  privateTag: {
    backgroundColor: Base.color.gray1,
  },
  privateTagText: {
    color: Base.color.gray3,
  },
})
