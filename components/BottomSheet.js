import React from 'react'
import { StyleSheet, Modal, TouchableOpacity, View, Text } from 'react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'
import PropTypes from 'prop-types'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

const BottomSheet = (props) => {
  const toread = props.post.toread ? 'read' : 'unread'
  return (
    <Modal
      animationType="slide"
      visible={props.modalVisible}
      transparent={true}
      onRequestClose={props.onClose}
      hardwareAccelerated={true}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1 }}
        onPress={props.onClose}
      />
      <View style={styles.bottomSheet}>
        <View style={styles.cell}>
          <Text
            style={styles.title}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {props.post.description}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.cell}
          onPress={props.onToggleRead(props.post)}
        >
          <Text style={styles.text}>{Strings.common.markAs} {toread}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.cell}
        >
          <Text style={styles.text}>{Strings.common.edit}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.cell}
          onPress={props.onDeletePost(props.post)}
        >
          <Text style={styles.text}>{Strings.common.delete}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.cell}
          onPress={props.onClose}
        >
          <Text style={styles.text}>{Strings.common.cancel}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

BottomSheet.propTypes = {
  modalVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onToggleRead: PropTypes.func.isRequired,
  onDeletePost: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: Base.color.white,
    elevation: 8,
    paddingBottom: Math.max(getBottomSpace(), Base.padding.small),
    paddingTop: Base.padding.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cell: {
    alignItems: 'center',
    flexDirection: 'row',
    height: Base.row.large,
    paddingHorizontal: Base.padding.medium,
  },
  text: {
    color: Base.color.gray4,
    fontSize: Base.font.large,
  },
  title: {
    color: Base.color.gray3,
    fontSize: Base.font.medium,
    marginTop: Base.padding.tiny,
  },
})

export default BottomSheet
