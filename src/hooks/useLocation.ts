import { useState } from "react";
import { toast } from "react-hot-toast";


export const useLocation = () => {
    const [loadingLocation, setLoadingLocation] = useState(false);

    const getPosition = (options?: PositionOptions): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    };

    const getCurrentLocation = async () => {
        setLoadingLocation(true);
        try {
            const position = await getPosition({
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            });

            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (error) {
            const geoError = error as GeolocationPositionError;
            let errorMessage = "Unable to retrieve your location";

            if (geoError.code === 1) errorMessage = "Permission denied. Please allow location access.";
            else if (geoError.code === 2) errorMessage = "Location unavailable. Check GPS.";
            else if (geoError.code === 3) errorMessage = "Request timed out.";

            toast.error(errorMessage);
            return null;
        } finally {
            setLoadingLocation(false);
        }
    };

    return { getCurrentLocation, loadingLocation };
};