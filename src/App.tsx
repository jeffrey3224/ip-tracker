import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapUpdater from "./MapUpdater";
import L from "leaflet";
import { ClipLoader } from "react-spinners";


type APIResponse = {
  ip: string;
  location: {
    country: string;
    region: string;
    city: string;
    lat: number;
    lng: number;
    timezone: number | string;
  };
  domains: string;
  isp: string;
};

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState<APIResponse>({
    ip: "",
    location: {
      lat: 0,
      lng: 0,
      city: "",
      country: "",
      region: "",
      timezone: 0
    },
    domains: "",
    isp: ""
  });
  const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });

  const apiKey = import.meta.env.VITE_API_KEY;

  const [isMobile, setIsMobile] = useState(true);
  const [loading, setLoading] = useState(true);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const locationIcon = new L.Icon({
    iconUrl: "/marker-icon.png",
    iconRetinaUrl: "/marker-icon-2x.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41], 
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })


 const getUserData = async () => {
  setLoading(true);
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const timeZoneOffset = new Date().getTimezoneOffset() / -60
    const tzString = `${timeZoneOffset >= 0 ? "+" : "-"}${Math.abs(timeZoneOffset).toString().padStart(2, "0")}:00`;

    if (data && data.latitude && data.longitude) {
      setData({
        ip: data.ip,
        location: {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          country: data.country,
          region: data.region,
          timezone: tzString,
        },
        domains: "",
        isp: data.org
      })
      setLocation({lat: data.latitude, lng: data.longitude})
      console.log(data)
    }
  }
  catch (error) {
    console.log(error)
  }
  finally {
    setLoading(false);
  }
 }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    getUserData();

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  const handleFetch = async (inputValue: string | null) => 
  {
    setLoading(true)
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
    setLoading(false);
  };

  const handleKeyDown = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key === "Enter") {
      handleFetch(inputValue)
    }
  }

  const filteredProps = [
    {
      header: "IP Address",
      value: data?.ip
    },
    {
      header: "Location",
      value: `${data?.location.city}, ${data?.location.region}`
    },
    {
      header: "Timezone",
      value: data?.location.timezone
    },
    {
      header: "ISP",
      value: data?.isp
    }
  ];
 
  return (
    <main className="w-[100vw] h-[100vh]">
      <div className="relative h-[35vh] text-center min-h-[180px] max-h-[320px]">
        <img 
          src={isMobile ? "/pattern-bg-mobile.png" : "/pattern-bg-desktop.png"}
          className="w-full h-full -z-1 absolute object-cover"
        />
        <div className="p-5">
          <h1 className="text-white text-2xl md:text-3xl mb-4 md:mb-7 font-bold">IP Address Tracker
          </h1>
          <div className="flex justify-center h-10">
            <input
              type="text"
              value={inputValue}
              onChange={handleInput}
              placeholder="Search for any IP address or domain"
              className="w-[70vw] max-w-[500px] p-2 bg-white rounded-l-lg text-[12px] sm:text-base h-11"
              onKeyDown={(e) => handleKeyDown(e)}
            />
            <button onClick={() => handleFetch(inputValue)} className="rounded-r-lg bg-black w-10 flex justify-center p-3 cursor-pointer h-11">
              <img src="icon-arrow.svg"/>
            </button>
          </div>
        </div>
      </div>
      <div className={`w-[calc(60vw+40px)] md:w-[calc(85vw+25px)] max-w-[1100px] py-6 bg-white absolute left-1/2 -translate-x-1/2 z-20 top-35 md:top-50 rounded-lg shadow-2xl p-3 flex flex-col items-center md:flex-row justify-center font-bold space-y-2 md:space-y-0 md:justify-evenly text-xl md:text-[18px] lg:text-2xl`}>

        {loading ? 
          <div className="w-[60vw] h-40 bg-white flex
          items-center justify-center">
           <ClipLoader color="#00008B" size={50} />
          </div>
        : 
          filteredProps.map((prop, index) => {
            let isLastProp = false;
            if (index === filteredProps.length - 1) {
              isLastProp = true;
            }

            return (
              <div key={index} className={`flex flex-col items-center justify-center w-1/2 md:min-w-[132px] md:w-1/4 md:items-start md:h-[90px] lg:h-[100px] md:justify-start border-gray-400 md:px-3
              ${
                isLastProp ? 
                  "border-0" :
                  isMobile ? 
                    "border-0" : 
                    "border-r"}`}>
                <h1 className="text-gray-400 text-xs">{prop.header.toUpperCase()}</h1>
                <p className="text-center md:text-left leading-tight">{prop?.value ? prop?.value : "No data"}</p>
              </div>
            )
          })
        }
      </div>

      <MapContainer center={[location.lat, location.lng] as [number, number]} zoom={13} className="h-[70vh] w-[100%] z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <Marker position={[location.lat, location.lng]} icon={locationIcon}>
          <Popup>
            {data ? `${data.location.city}, ${data.location.country}` : "No data"}
          </Popup>
        </Marker>
        <MapUpdater lat={location.lat} lng={location.lng}/>
      </MapContainer>
    </main>
  );
}
