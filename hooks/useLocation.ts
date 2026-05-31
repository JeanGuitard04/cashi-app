import * as Location from "expo-location";
import { useCallback, useState } from "react";

export interface LocationData {
  latitude: number;
  longitude: number;
}

export const useLocation = () => {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { granted } =
        await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setError("Se necesita permiso para acceder a la ubicación");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setLocationState({ latitude, longitude });
    } catch {
      setError("No se pudo obtener la ubicación");
    } finally {
      setLoading(false);
    }
  }, []);

  const setLocation = useCallback((next: LocationData | null) => {
    setLocationState(next);
    setError(null);
  }, []);

  const clearLocation = useCallback(() => {
    setLocationState(null);
    setError(null);
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    setLocation,
    clearLocation,
  };
};
