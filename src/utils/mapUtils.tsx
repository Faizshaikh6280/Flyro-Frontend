import axios from 'axios';

export const getLatLong = async (placeId: string) => {
  try {
    const response = await axios.get(
      'https://maps.google.com/maps/api/place/details/json',
      {
        params: {
          placeid: placeId,
          key: process.env.EXPO_PUBLIC_MAP_API_KEY,
        },
      }
    );
    const data = response.data;
    if (data.status === 'OK' && data.result) {
      const location = data.result.geometry.location;
      const address = data.result.formatted_address;

      return {
        latitude: location.lat,
        longitude: location.lng,
        address: address,
      };
    } else {
      throw new Error('Unable to fetch location details');
    }
  } catch (error) {
    throw new Error('Unable to fetch location details');
  }
};

export const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(`https://eu1.locationiq.com/v1/reverse`, {
      params: {
        key: process.env.EXPO_PUBLIC_MAP_API_KEY,
        lat: latitude,
        lon: longitude,
        format: 'json',
      },
    });

    if (response.data && response.data.display_name) {
      const address = response.data.display_name;
      return address;
    } else {
      console.log('Geocoding failed: No results found');
      return '';
    }
  } catch (error) {
    console.log('Error during reverse geocoding: ', error);
    return '';
  }
};

export const getPlacesSuggestions = async (query: string) => {
  try {
    const response = await axios.get(
      `https://api.locationiq.com/v1/autocomplete`, // PositionStack forward geocoding endpoint
      {
        params: {
          key: process.env.EXPO_PUBLIC_MAP_API_KEY,
          q: query,
          limit: 6,
          countrycodes: 'IN',
        },
      }
    );

    if (response.data.length > 0) {
      // Return place suggestions with essential information (place name and location)
      return extractPlaceData(response.data);
    } else {
      console.error('No suggestions found');
      return [];
    }
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
    return [];
  }
};

// Helper function to extract relevant data from the response
function extractPlaceData(data: any) {
  const formatedLocations = data.map((item: any) => ({
    place_id: item.place_id, // Unique place ID (may differ in some APIs)
    title: item.display_place, // Name or title of the place
    description: item.display_address, // Type or category of the place
  }));

  return formatedLocations;
}

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateFare = (distance: number) => {
  const rateStructure = {
    bike: { baseFare: 10, perKmRate: 5, minimumFare: 25 },
    auto: { baseFare: 15, perKmRate: 7, minimumFare: 30 },
    cabEconomy: { baseFare: 20, perKmRate: 10, minimumFare: 50 },
    cabPremium: { baseFare: 30, perKmRate: 15, minimumFare: 70 },
  };

  const fareCalculation = (
    baseFare: number,
    perKmRate: number,
    minimumFare: number
  ) => {
    const calculatedFare = baseFare + distance * perKmRate;
    return Math.max(calculatedFare, minimumFare);
  };

  return {
    bike: fareCalculation(
      rateStructure.bike.baseFare,
      rateStructure.bike.perKmRate,
      rateStructure.bike.minimumFare
    ),
    auto: fareCalculation(
      rateStructure.auto.baseFare,
      rateStructure.auto.perKmRate,
      rateStructure.auto.minimumFare
    ),
    cabEconomy: fareCalculation(
      rateStructure.cabEconomy.baseFare,
      rateStructure.cabEconomy.perKmRate,
      rateStructure.cabEconomy.minimumFare
    ),
    cabPremium: fareCalculation(
      rateStructure.cabPremium.baseFare,
      rateStructure.cabPremium.perKmRate,
      rateStructure.cabPremium.minimumFare
    ),
  };
};

function quadraticBezierCurve(
  p1: any,
  p2: any,
  controlPoint: any,
  numPoints: any
) {
  const points = [];
  const step = 1 / (numPoints - 1);

  for (let t = 0; t <= 1; t += step) {
    const x =
      (1 - t) ** 2 * p1[0] + 2 * (1 - t) * t * controlPoint[0] + t ** 2 * p2[0];
    const y =
      (1 - t) ** 2 * p1[1] + 2 * (1 - t) * t * controlPoint[1] + t ** 2 * p2[1];
    const coord = { latitude: x, longitude: y };
    points.push(coord);
  }

  return points;
}

const calculateControlPoint = (p1: any, p2: any) => {
  const d = Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
  const scale = 1; // Scale factor to reduce bending
  const h = d * scale; // Reduced distance from midpoint
  const w = d / 2;
  const x_m = (p1[0] + p2[0]) / 2;
  const y_m = (p1[1] + p2[1]) / 2;

  const x_c =
    x_m +
    ((h * (p2[1] - p1[1])) /
      (2 * Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2))) *
      (w / d);
  const y_c =
    y_m -
    ((h * (p2[0] - p1[0])) /
      (2 * Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2))) *
      (w / d);

  const controlPoint = [x_c, y_c];
  return controlPoint;
};

export const getPoints = (places: any) => {
  const p1 = [places[0].latitude, places[0].longitude];
  const p2 = [places[1].latitude, places[1].longitude];
  const controlPoint = calculateControlPoint(p1, p2);

  return quadraticBezierCurve(p1, p2, controlPoint, 100);
};

export const vehicleIcons: Record<
  'bike' | 'auto' | 'cabEconomy' | 'cabPremium',
  { icon: any }
> = {
  bike: { icon: require('@/assets/icons/bike.png') },
  auto: { icon: require('@/assets/icons/auto.png') },
  cabEconomy: { icon: require('@/assets/icons/cab.png') },
  cabPremium: { icon: require('@/assets/icons/cab_premium.png') },
};
