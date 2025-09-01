import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapUpdater from "./MapUpdater";


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
  const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });

  const apiKey = import.meta.env.VITE_API_KEY;

  const [isMobile, setIsMobile] = useState(true);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    console.log(`is mobile: ${isMobile}`);
    const handleResize = () => {
      if (window.innerWidth >= 768)
      setIsMobile(false);

      else setIsMobile(true);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile])

  const handleFetch = async (inputValue: string, e?: React.KeyboardEvent<HTMLInputElement> | null) => 
  {
    if (e && e.key === "Enter") {
      if (!inputValue) {
        alert("Invalid Input");
      } else {
        try {
          const res = await fetch(
            `${apiKey}Address=${inputValue}&domain=${inputValue}`
          );
          const json: APIResponse = await res.json();
          setData(json);
          setLocation({ lat: json.location.lat, lng: json.location.lng });
        } catch (error) {
          console.log(error);
        }
      }
    }
   
  };

  return (
    <div className="w-[100vw] h-[100vh]">
      <div className="relative h-[35vh] text-center min-h-[180px] max-h-[320px]">
        <img 
          src={isMobile ? "/pattern-bg-mobile.png" : "/pattern-bg-desktop.png"}
          className="w-full h-full -z-1 absolute object-cover"
        />
        <div className="p-4">
          <h1 className="text-white text-xl md:text-3xl mb-4 md:mb-5 font-bold">IP Address Tracker
          </h1>
          <div className="flex justify-center h-10">
            <input
              type="text"
              value={inputValue}
              onChange={handleInput}
              placeholder="Search for any IP address"
              className="w-[70vw] max-w-[500px] p-2 bg-white rounded-l-lg text-sm"
              onKeyDown={(e) => handleFetch(inputValue, e)}
            />
            <button onClick={() => handleFetch(inputValue, null)} className="rounded-r-lg bg-black w-10 flex justify-center p-3">
              <img src="icon-arrow.svg"/>
            </button>
          </div>
        </div>
      </div>
      <div className={data ? `w-[calc(60vw+40px)] md:w-[calc(70vw+40px)] max-w-[1100px] py-6 bg-white absolute left-1/2 -translate-x-1/2 z-20 top-30 md:top-40 rounded-lg shadow-2xl p-3 flex flex-col items-center md:flex-row justify-center font-bold space-y-2 md:space-y-0 md:justify-evenly` : "hidden"}>
        {data?.ip && <div className={`flex flex-col items-center justify-center w-1/2 md:min-w-[132px] md:w-1/4 md:items-start md:h-[70px] md:justify-start border-gray-400 md:px-3 ${isMobile ? "border-b-1" : "border-r-1"}`}>
          <h1 className="text-gray-400 text-xs">IP ADDRESS</h1>
          <p>{data?.ip}</p>
        </div>}
        {data?.location.city && <div className={`flex flex-col items-center justify-center w-1/2 md:min-w-[132px] md:w-1/4 md:items-start md:h-[70px] md:justify-start border-gray-400 md:px-3 ${isMobile ? "border-b-1" : "border-r-1"}`}>
          <h1 className="text-gray-400 text-xs">LOCATION</h1>
          <p>{`${data?.location.city}, ${data?.location.region}`}</p>
        </div>}
        {data?.location.timezone && <div className={`flex flex-col items-center justify-center w-1/2 md:min-w-[132px] md:w-1/4 md:items-start md:h-[70px] md:justify-start border-gray-400 md:px-3 ${isMobile ? "border-b-1" : "border-r-1"}`}>
          <h1 className="text-gray-400 text-xs">TIMEZONE</h1>
          <p>{data?.location.timezone}</p>
        </div>}
        {data?.isp && <div className="flex flex-col items-center justify-center w-1/2 md:min-w-[132px] md:w-1/4 md:items-start md:h-[70px] md:justify-start border-gray-400 md:px-3">
          <h1 className="text-gray-400 text-xs">ISP</h1>
          <p>{data?.isp}</p>
        </div>}
      </div>

      <MapContainer center={[location.lat, location.lng] as [number, number]} zoom={13} className="h-[70vh] w-[100%] z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <Marker position={[location.lat, location.lng]}>
          <Popup>
            {data ? `${data.location.city}, ${data.location.country}` : "No data"}
          </Popup>
        </Marker>
        <MapUpdater lat={location.lat} lng={location.lng}/>
      </MapContainer>
    </div>
  );
}
