import * as ImagePicker from 'expo-image-picker';

export const requestMediaLibraryPermission = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
};

export const requestCameraPermission = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      console.log('Media library permission denied');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    return null;
  }
};

export const takePhotoWithCamera = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.log('Camera permission denied');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};
