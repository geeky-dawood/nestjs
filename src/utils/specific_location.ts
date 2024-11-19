import { Decimal } from '@prisma/client/runtime/library';
import * as turf from '@turf/turf';

export function getSpecifiAreaFilter(lat: Decimal, lng: Decimal) {
  const latitude = Number(lat);
  const longitude = Number(lng);

  //use turf to get the area of the user
  const point = turf.point([longitude, latitude]);
  // Create a 1 km radius buffer around the point
  const buffer = turf.buffer(point, 1, { units: 'kilometers' });

  console.log('====================================');
  console.log(buffer);
  console.log('====================================');
}
