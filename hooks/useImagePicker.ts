import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

export const useImagePicker = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickFromGallery = useCallback(async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Se necesita permiso para acceder a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setError(null);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Se necesita permiso para acceder a la cámara");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setError(null);
    }
  }, []);

  const setImage = useCallback((uri: string | null) => {
    setImageUri(uri);
    setError(null);
  }, []);

  const clearImage = useCallback(() => {
    setImageUri(null);
    setError(null);
  }, []);

  return {
    imageUri,
    error,
    pickFromGallery,
    takePhoto,
    setImage,
    clearImage,
  };
};
