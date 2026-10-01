const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');

const divsMeta = JSON.parse(fs.readFileSync(path.join(dataDir, 'meta-divisions.json'))).divisions;
const distsMeta = JSON.parse(fs.readFileSync(path.join(dataDir, 'meta-districts.json'))).districts;
const upasMeta = JSON.parse(fs.readFileSync(path.join(dataDir, 'meta-upazilas.json'))).upazilas;
const dhakaCity = JSON.parse(fs.readFileSync(path.join(dataDir, 'dhaka-city.json')));

const divGeo = JSON.parse(fs.readFileSync(path.join(dataDir, 'bd-divisions.geojson')));
const distGeo = JSON.parse(fs.readFileSync(path.join(dataDir, 'bd-districts.geojson')));
const upaGeo = JSON.parse(fs.readFileSync(path.join(dataDir, 'bd-upazilas.geojson')));

function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Curated modern division palette
const divisionThemes = {
  'Dhaka': { color: '#6366f1', bn: 'ঢাকা' },
  'Chattogram': { color: '#0284c7', bn: 'চট্টগ্রাম' },
  'Sylhet': { color: '#059669', bn: 'সিলেট' },
  'Rajshahi': { color: '#d97706', bn: 'রাজশাহী' },
  'Khulna': { color: '#0d9488', bn: 'খুলনা' },
  'Barishal': { color: '#7c3aed', bn: 'বরিশাল' },
  'Rangpur': { color: '#db2777', bn: 'রংপুর' },
  'Mymensingh': { color: '#ea580c', bn: 'ময়মনসিংহ' }
};

// Compute centroid of polygon or multipolygon
function getCentroidAndBbox(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0, count = 0;

  function traverse(coords) {
    if (typeof coords[0] === 'number') {
      const [x, y] = coords;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      sumX += x;
      sumY += y;
      count++;
    } else {
      for (const c of coords) traverse(c);
    }
  }

  traverse(geometry.coordinates);
  return {
    center: [count ? sumY / count : 0, count ? sumX / count : 0], // [lat, lng]
    bbox: [minY, minX, maxY, maxX] // [minLat, minLng, maxLat, maxLng]
  };
}

// Ray-casting point in polygon
function pointInPoly(pt, poly) {
  const [lat, lng] = pt;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]; // [lng, lat]
    const [xj, yj] = poly[j];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInGeometry(pt, geom) {
  if (geom.type === 'Polygon') {
    return pointInPoly(pt, geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      if (pointInPoly(pt, poly[0])) return true;
    }
  }
  return false;
}

// 1. Process Divisions
console.log('Processing Divisions...');
divGeo.features.forEach(f => {
  const name = f.properties.shapeName;
  let standardName = name;
  if (name === 'Chittagong') standardName = 'Chattogram';
  if (name === 'Rajshani') standardName = 'Rajshahi';
  if (name === 'Barisal') standardName = 'Barishal';

  const theme = divisionThemes[standardName] || { color: '#64748b', bn: standardName };
  const geoInfo = getCentroidAndBbox(f.geometry);

  f.properties = {
    id: norm(standardName),
    name: standardName,
    bn_name: theme.bn,
    color: theme.color,
    center: geoInfo.center,
    bbox: geoInfo.bbox
  };
});

// 2. Process Districts
console.log('Processing Districts...');
const districtMap = new Map();

distGeo.features.forEach(f => {
  const rawName = f.properties.shapeName;
  let cleanName = rawName;
  if (cleanName === 'Brahamanbaria') cleanName = 'Brahmanbaria';
  if (cleanName === 'Khagrachhari') cleanName = 'Khagrachari';
  if (cleanName === 'Sirajganj') cleanName = 'Sirajgonj';
  if (cleanName === 'Bogra') cleanName = 'Bogura';
  if (cleanName === 'Barisal') cleanName = 'Barishal';
  if (cleanName === 'Chittagong') cleanName = 'Chattogram';
  if (cleanName === 'Comilla') cleanName = 'Cumilla';
  if (cleanName === 'Jessore') cleanName = 'Jashore';
  if (cleanName === 'Netrakona') cleanName = 'Netrokona';

  const meta = distsMeta.find(d => norm(d.name) === norm(cleanName)) || {};
  const divMeta = divsMeta.find(d => d.id === meta.division_id) || {};
  const divTheme = divisionThemes[divMeta.name] || { color: '#6366f1', bn: divMeta.bn_name || '' };

  const geoInfo = getCentroidAndBbox(f.geometry);

  f.properties = {
    id: norm(cleanName),
    name: meta.name || cleanName,
    bn_name: meta.bn_name || cleanName,
    division_name: divMeta.name || 'Bangladesh',
    division_bn: divTheme.bn,
    division_id: meta.division_id || '',
    color: divTheme.color,
    center: geoInfo.center,
    bbox: geoInfo.bbox,
    upazila_count: 0
  };

  districtMap.set(f.properties.id, f);
});

// 3. Process Upazilas and assign to District & Division
console.log('Processing Upazilas...');

// Flatten dhaka city areas for lookup
const cityAreaLookup = new Map();
if (dhakaCity && dhakaCity.areas) {
  dhakaCity.areas.forEach(a => {
    cityAreaLookup.set(norm(a.name), a.bn_name);
    if (a.sub_areas) {
      a.sub_areas.forEach(s => cityAreaLookup.set(norm(s.name), s.bn_name));
    }
  });
}

upaGeo.features.forEach((f, idx) => {
  const rawName = f.properties.shapeName;
  const geoInfo = getCentroidAndBbox(f.geometry);
  const pt = geoInfo.center; // [lat, lng]

  // Find parent district by point-in-geometry or minimum distance to bbox center
  let matchedDistrict = null;
  for (const [id, distFeature] of districtMap.entries()) {
    const bbox = distFeature.properties.bbox;
    // Fast bbox check
    if (pt[0] >= bbox[0] - 0.05 && pt[0] <= bbox[2] + 0.05 &&
        pt[1] >= bbox[1] - 0.05 && pt[1] <= bbox[3] + 0.05) {
      if (pointInGeometry(pt, distFeature.geometry)) {
        matchedDistrict = distFeature;
        break;
      }
    }
  }

  // Fallback: nearest district centroid if on border
  if (!matchedDistrict) {
    let minDist = Infinity;
    for (const [id, distFeature] of districtMap.entries()) {
      const dCenter = distFeature.properties.center;
      const dist = Math.hypot(dCenter[0] - pt[0], dCenter[1] - pt[1]);
      if (dist < minDist) {
        minDist = dist;
        matchedDistrict = distFeature;
      }
    }
  }

  if (matchedDistrict) {
    matchedDistrict.properties.upazila_count = (matchedDistrict.properties.upazila_count || 0) + 1;
  }

  // Find Bengali name
  let bnName = '';
  const metaMatch = upasMeta.find(u => norm(u.name) === norm(rawName));
  if (metaMatch && metaMatch.bn_name) {
    bnName = metaMatch.bn_name;
  } else if (cityAreaLookup.has(norm(rawName))) {
    bnName = cityAreaLookup.get(norm(rawName));
  } else {
    bnName = rawName; // Fallback to English name
  }

  f.properties = {
    id: norm(rawName) + '-' + idx,
    name: rawName,
    bn_name: bnName,
    district_name: matchedDistrict ? matchedDistrict.properties.name : '',
    district_bn: matchedDistrict ? matchedDistrict.properties.bn_name : '',
    district_id: matchedDistrict ? matchedDistrict.properties.id : '',
    division_name: matchedDistrict ? matchedDistrict.properties.division_name : '',
    division_bn: matchedDistrict ? matchedDistrict.properties.division_bn : '',
    color: matchedDistrict ? matchedDistrict.properties.color : '#6366f1',
    center: geoInfo.center,
    bbox: geoInfo.bbox
  };
});

// 4. Build Search Index
console.log('Building Search Index...');
const searchIndex = [];

// Add divisions
divGeo.features.forEach(f => {
  searchIndex.push({
    type: 'division',
    name: f.properties.name,
    bn_name: f.properties.bn_name,
    parent: 'বাংলাদেশ',
    center: f.properties.center,
    bbox: f.properties.bbox,
    color: f.properties.color
  });
});

// Add districts
distGeo.features.forEach(f => {
  searchIndex.push({
    type: 'district',
    id: f.properties.id,
    name: f.properties.name,
    bn_name: f.properties.bn_name,
    parent: `${f.properties.division_bn} বিভাগ`,
    division: f.properties.division_name,
    center: f.properties.center,
    bbox: f.properties.bbox,
    color: f.properties.color,
    upazila_count: f.properties.upazila_count
  });
});

// Add upazilas
upaGeo.features.forEach(f => {
  searchIndex.push({
    type: 'upazila',
    id: f.properties.id,
    name: f.properties.name,
    bn_name: f.properties.bn_name,
    parent: `${f.properties.district_bn} জেলা`,
    district: f.properties.district_name,
    division: f.properties.division_name,
    center: f.properties.center,
    bbox: f.properties.bbox,
    color: f.properties.color
  });
});

// Write output files
fs.writeFileSync(path.join(dataDir, 'divisions.json'), JSON.stringify(divGeo));
fs.writeFileSync(path.join(dataDir, 'districts.json'), JSON.stringify(distGeo));
fs.writeFileSync(path.join(dataDir, 'upazilas.json'), JSON.stringify(upaGeo));
fs.writeFileSync(path.join(dataDir, 'search-index.json'), JSON.stringify(searchIndex));

console.log('Finished successfully!');
console.log(`Summary:`);
console.log(`- Divisions: ${divGeo.features.length}`);
console.log(`- Districts: ${distGeo.features.length}`);
console.log(`- Upazilas: ${upaGeo.features.length}`);
console.log(`- Search index items: ${searchIndex.length}`);
