import React from 'react'
import { StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, View, Text } from 'react-native'
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
      <TouchableWithoutFeedback onPress={props.onClose}>
        <View style={styles.container}>
          <View style={styles.bottomsheet}>
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
              onPress={props.onToggleToread(props.post)}
            >
              <Text style={styles.text}>{Strings.common.markAs} {toread}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.cell}
              onPress={props.onEditPost(props.post)}
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
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

BottomSheet.propTypes = {
  modalVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onToggleToread: PropTypes.func.isRequired,
  onEditPost: PropTypes.func.isRequired,
  onDeletePost: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Base.color.black36,
  },
  bottomsheet: {
    backgroundColor: Base.color.white,
    borderTopLeftRadius: Base.radius.large,
    borderTopRightRadius: Base.radius.large,
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
