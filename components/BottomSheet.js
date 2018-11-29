import React from 'react'
import { StyleSheet, Modal, TouchableOpacity, View, Text, Platform } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import PropTypes from 'prop-types'
import Base from 'app/assets/Base'
import Strings from 'app/assets/Strings'

const BottomView = Platform.select({
  ios: () => SafeAreaView,
  android: () => View,
})()

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
      <BottomView style={styles.bottomSheet}>
        <View style={styles.section}>
          <View style={styles.cell}>
            <Text
              style={[styles.text, styles.title]}
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
      </BottomView>
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
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  section: {
    paddingVertical: Base.padding.small,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Base.row.large,
    paddingHorizontal: Base.padding.medium,
  },
  text: {
    color: Base.color.gray4,
    fontSize: Base.font.large,
  },
  title: {
    fontWeight: Base.font.bold,
  },
})

export default BottomSheet
