import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// eslint-disable-next-line import/no-unresolved
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

type Props = {
  photos: string[];
  setPhotos: (photos: string[]) => void;
  maxPhotos?: number;
};

export default function PhotoPicker({ photos, setPhotos, maxPhotos = 5 }: Props) {
  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `You can upload a maximum of ${maxPhotos} photos`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0] && result.assets[0].uri) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <View>
      <View style={styles.photoGrid}>
        {photos.map((uri, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri }} style={styles.photo} contentFit="cover" />
            <TouchableOpacity style={styles.removePhotoButton} onPress={() => removePhoto(index)}>
              <Ionicons name="close-circle" size={22} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        {photos.length < maxPhotos && (
          <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage} activeOpacity={0.8}>
            <Ionicons name="camera" size={32} color={Colors.textSecondary} />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
