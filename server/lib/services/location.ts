import Location, { ILocation } from '../models/Location';
import { LOCATION_FEATURE } from '../types/generic';

export async function hasLocationFeatureById(locationId: number, feature: LOCATION_FEATURE) {
  const location = await Location
		.findOne({
			_id: locationId
		})
		.exec();

	if (!location) {
    return null;
  }

  return location.features.includes(feature);
}

export function hasLocationFeature(location: ILocation, feature: LOCATION_FEATURE) {
  return location.features.includes(feature);
}
