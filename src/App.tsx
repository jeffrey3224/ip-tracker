import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";


type APIResponse = {
  ip: string;
  location: {
    country: string;
    region: string;
    city: string;
    lat: number;
    lng: number;
    timezone: number;
  };
  domains: string;
  as: {
    asn: number;
    name: string;
    route: string;
    domain: string;
    type: string;
  };
  isp: string;
};

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState<APIResponse | null>(null);
  const [response, setResponse] = useState("");
  const [location, setLocation] = useState({ lat: 51.505, long: -0.09 });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleFetch = async (inputValue: string) => {
    if (!inputValue) {
      setResponse("Invalid Input");
    } else {
      try {
        const res = await fetch(
          `https://geo.ipify.org/api/v2/country,city?apiKey=at_bahOPZifo7rBdcfRNw0q8GirYCl8J&ipAddress=${inputValue}&domain=${inputValue}`
        );
        const json: APIResponse = await res.json();
        setData(json);
        setLocation({ lat: json.location.lat, long: json.location.lng });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div style={{ position: "relative", height: "150px", textAlign: "center" }}>
        <h1>IP Address Tracker</h1>
        <input
          type="text"
          value={inputValue}
          onChange={handleInput}
          placeholder="Search for any IP address or domain"
          style={{ width: "300px", padding: "6px" }}
        />
        <button onClick={() => handleFetch(inputValue)}>Get</button>
      </div>

      <MapContainer center={[location.lat, location.long]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <Marker position={[location.lat, location.long]}>
          <Popup>
            {data ? `${data.location.city}, ${data.location.country}` : "No data"}
          </Popup>
        </Marker>
      </MapContainer>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {!data ? response : (
          <div>
            <p>Country: {data.location.country}</p>
            <p>City: {data.location.city}</p>
            <p>Lat: {data.location.lat}</p>
            <p>Lng: {data.location.lng}</p>
          </div>
        )}
      </div>
    </div>
  );
}
