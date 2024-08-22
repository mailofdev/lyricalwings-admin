import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useSelector } from 'react-redux';
import 'leaflet/dist/leaflet.css';
import { Container, Row, Col } from 'react-bootstrap';
import L from 'leaflet';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  shadowSize: [41, 41],
});

const WorldMap = () => {
  const { users } = useSelector((state) => state.dashboard);

  // Placeholder city data with coordinates
  const cityData = [
    { city: 'Pune', country: 'India', lat: 18.5204, lng: 73.8567 },
    { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
    { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
    // Add more cities as needed
  ];

  // Filtering and mapping city data to user locations
  const userLocations = users.map((user) => {
    const city = cityData.find((c) => c.city.toLowerCase() === user.city.toLowerCase());
    return city ? { ...city, displayName: user.displayName } : null;
  }).filter(Boolean);

  useEffect(() => {
    document.title = "User Engagement Map";
  }, []);

  return (
    <Container fluid className="p-4">
      <Row>
        <Col md={12} className="mb-4">
          <h2 className="text-center mb-4">User Engagement Map</h2>
          <MapContainer
            style={{ height: "600px", width: "100%", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
            center={[20, 0]} // Center of the world map
            zoom={2}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {userLocations.map((location, index) => (
              <Marker key={index} position={[location.lat, location.lng]} icon={customIcon}>
                <Popup>
                  <strong>{location.displayName}</strong><br />
                  {location.city}, {location.country}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Col>
      </Row>
    </Container>
  );
};

export default WorldMap;
