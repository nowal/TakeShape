<select 
  className="text-xl font-medium mb-4 p-2 underline"
  value={selectedPage} 
  onChange={handlePageChange}
  style={{ fontSize: selectedPage === 'Completed Quotes' ? '2rem' : '1rem', fontWeight: selectedPage === 'Completed Quotes' ? 'bold' : 'normal' }}
>
  <option value="Available Quotes">Available Quotes</option>
  <option value="Accepted Quotes">Accepted Quotes</option>
  <option value="Completed Quotes">Completed Quotes</option>
</select>

const geocodeAddress = async (address: string) => {
    const apiKey =
      'AIzaSyCtM9oQWFui3v5wWI8A463_AN1QN0ITWAA';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      if (response.data.status === 'OK') {
        const location =
          response.data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      } else {
        console.error(
          'Geocoding error:',
          response.data.status,
          response.data.error_message
        );
      }
    } catch (error) {
      console.error('Geocoding request failed:', error);
    }
    return null;
  };

  const getDistanceFromCoordsInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c =
      2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

    const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

const isJobWithinRange = async (
    painterAddress: string,
    range: number,
    jobAddress: { lat: number; lng: number }
  ): Promise<boolean> => {
    const geocodedPainterAddress = await geocodeAddress(
      painterAddress
    );

    if (geocodedPainterAddress) {
      const { lat: painterLat, lng: painterLng } =
        geocodedPainterAddress;
      const { lat: jobLat, lng: jobLng } = jobAddress;

      const distance = getDistanceFromCoordsInKm(
        painterLat,
        painterLng,
        jobLat,
        jobLng
      );
      return distance <= range * 1.60934; // Convert miles to kilometers
    } else {
      console.error(
        'Failed to geocode painter address:',
        painterAddress
      );
      return false;
    }
  };