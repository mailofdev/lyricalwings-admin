import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useSelector } from 'react-redux';
import 'leaflet/dist/leaflet.css';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
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

// Nominatim API URL
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

const WorldMap = () => {
    const { users } = useSelector((state) => state.dashboard);
    const [cityData, setCityData] = useState([]);
    const [userLocations, setUserLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // document.title = "User Engagement Map";

        const fetchCityData = async () => {
            try {
                // Define a list of cities to get coordinates for
                const cities = cityData.city;

                // Fetch coordinates for each city
                const cityRequests = cities.map((city) =>
                    fetch(`${NOMINATIM_API_URL}?q=${encodeURIComponent(city)}&format=json&addressdetails=1`)
                        .then(response => response.json())
                );
                const responses = await Promise.all(cityRequests);

                // Extract coordinates from responses
                const fetchedCityData = responses.map((data, index) => {
                    const result = data[0];
                    return {
                        city: cities[index],
                        country: result.address ? result.address.country : 'Unknown',
                        lat: result.lat,
                        lng: result.lon
                    };
                });

                setCityData(fetchedCityData);
            } catch (error) {
                console.error('Error fetching city data:', error);
            }
        };

        const loadUserLocations = async () => {
            const locations = [];
            for (const user of users) {
                const city = cityData.find((c) => c.city.toLowerCase() === user.city.toLowerCase());
                if (city) {
                    locations.push({ ...city, displayName: user.displayName });
                } else {
                    // Handle cases where user city is not in predefined list
                    const coords = await fetchCoordinates(user.city);
                    if (coords) {
                        locations.push({ city: user.city, country: user.country, ...coords, displayName: user.displayName });
                    }
                }
            }
            setUserLocations(locations);
            setLoading(false); // Set loading to false once data is loaded
        };

        const fetchCoordinates = async (city) => {
            try {
                const response = await fetch(`${NOMINATIM_API_URL}?q=${encodeURIComponent(city)}&format=json&addressdetails=1`);
                const results = await response.json();
                if (results.length > 0) {
                    return {
                        lat: results[0].lat,
                        lng: results[0].lon
                    };
                }
                return null;
            } catch (error) {
                console.error('Error fetching coordinates:', error);
                return null;
            }
        };

        // Start fetching data
        fetchCityData().then(loadUserLocations);
    }, [users, cityData]);

    return (
        <Container fluid className='p-4'>
            <Row>
                <Col md={12} className="mb-4">
                    <h2 className="text-center mb-4 form-label">User Engagement</h2>
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p>Loading map, please wait...</p>
                        </div>
                    ) : (
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
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default WorldMap;
