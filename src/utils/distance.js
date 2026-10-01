// Geodetic Distance and Route Calculation for Bangladesh

// Convert degrees to radians
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Great-circle distance between two points (Haversine formula) in kilometers
export function calculateStraightDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimated road distance (typically 1.32x straight-line in Bangladesh due to rivers and highway routes)
export function calculateRoadDistance(lat1, lon1, lat2, lon2) {
  const straight = calculateStraightDistance(lat1, lon1, lat2, lon2);
  return Math.round(straight * 1.32);
}

// Estimated drive duration in hours and minutes (avg speed ~48 km/h considering BD highways)
export function estimateDriveTime(distanceKm) {
  const avgSpeedKmH = 48;
  const totalHours = distanceKm / avgSpeedKmH;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  if (hours === 0) return `${minutes} মিনিট`;
  if (minutes === 0) return `${hours} ঘণ্টা`;
  return `${hours} ঘণ্টা ${minutes} মিনিট`;
}

// Generate curved arc line coordinates between two points for attractive map rendering
export function generateCurvedRoute(p1, p2, numPoints = 30) {
  const [lat1, lng1] = p1;
  const [lat2, lng2] = p2;

  const points = [];
  // Midpoint with slight offset perpendicular to vector
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;

  const dLng = lng2 - lng1;
  const dLat = lat2 - lat1;

  // Curvature factor
  const curvature = 0.15;
  const ctrlLat = midLat - dLng * curvature;
  const ctrlLng = midLng + dLat * curvature;

  // Quadratic Bezier curve
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * ctrlLat + t * t * lat2;
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * ctrlLng + t * t * lng2;
    points.push([lat, lng]);
  }

  return points;
}
