import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./App.css";
import Compass from "./Compass";
import Map from "./map";
import WebSocket from "./components/WebSocket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [weather, setWeather] = useState({});
  const [planeposition, setPlanePositon] = useState([0, 0]);
  const [source, setSource] = useState("MCO");
  const [destination, setDestination] = useState("IND");

  const [flightData, setFlightData] = useState({
    estimatedTimeRemaining: "2h 30m",
    flightDuration: "5h",
    landingAt: "JFK Airport",
    remainingRange: "1500 km",
    fuel: "80%",
    engine: "Normal",
  });

  const [waypoints, setWaypoints] = useState([]);

  const updateWaypoints = async (codes) => {
    const way = await Promise.all(
      codes.map(async (code) => {
        return await getCoordinates(code);
      })
    );
    setWaypoints(way);
    setPlanePositon(way[0]);
  };

  const getCoordinates = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        return [lat, lon];
      }
      return null;
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(
          "https://api.openweathermap.org/data/2.5/weather",
          {
            params: {
              lat: planeposition[0],
              lon: planeposition[1],
              appid: "d6555c542ca1b8195223d3d5848cc1f8",
            },
          }
        );

        const weatherData = response.data;
        console.log(weatherData);
        setWeather({
          temperature: weatherData.main.temp,
          precipitation: weatherData.rain ? weatherData.rain["1h"] : 0,
          humidity: weatherData.main.humidity,
          pressure: weatherData.main.pressure,
          wind: weatherData.wind.speed,
          visibility: weatherData.visibility,
        });
      } catch (error) {
        console.error("Error fetching weather data", error);
      }
    };

    fetchWeatherData();
  }, [planeposition]);

  // fetcing flightdata and waypoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.post("http://localhost:5000/route", {
          origin: source,
          destination: destination,
        });
        toast("Refreshing...");
        console.log(data);
        setFlightData({
          estimatedTimeRemaining: "2h 30m",
          flightdelay: data.total_delay,
          landingAt: `${data.path[data.path.length - 1]} Airport`,
          remainingRange: `${data.cost}km`,
          fuel: "80%",
          engine: "Normal",
        });
        updateWaypoints(data.path);
      } catch (error) {
        toast("Failed to update waypoints");
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 50000); // set for 50 secounds, can change it as you wish
    return () => {
      clearInterval(interval);
    };
  }, [source, destination]);

  return (
    <div className="dashboard">
      {/* <WebSocket /> */}
      <div className="dashboard-header">
        <div className="compass">
          <Compass />
          {/* Add a compass image or component here */}
        </div>
        <div className="location">
          <h3>Current Location</h3>
          <p>
            Latitude: {planeposition[0]} &nbsp;&nbsp; Longitude:{" "}
            {planeposition[1]}
          </p>
        </div>
        <div className="flight-info">
          <div>
            <p className="flight-info-heading">Estimated Time Remaining</p>{" "}
            <p className="flightinfovalue">
              {flightData.estimatedTimeRemaining}
            </p>
          </div>
          <div>
            <p className="flight-info-heading">Flight Delay</p>{" "}
            <p className="flightinfovalue">{flightData.flightdelay}</p>
          </div>

          <div>
            <p className="flight-info-heading">Landing At</p>{" "}
            <p className="flightinfovalue">{flightData.landingAt}</p>
          </div>
          <div>
            <p className="flight-info-heading">Remaining Range</p>{" "}
            <p className="flightinfovalue">{flightData.remainingRange}</p>
          </div>
        </div>
      </div>
      {/* <div className="map-container">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} />
          <ZoomControl position="topright" />
        </MapContainer>
      </div> */}
      <Map waypoints={waypoints} planeposition={planeposition} />
      <div className="dashboard-footer">
        <div className="weather">
          <h3>Current Weather Conditions</h3>
          <div className="parameter">
            <div className="weatheritem">
              <img src="/thermometer.svg" alt="temperature" />
              <p> {weather.temperature}</p>
            </div>
            <div className="weatheritem">
              <img src="/precipitation.svg" alt="precipitation" />
              <p> {weather.precipitation}</p>
            </div>
            <div className="weatheritem">
              <img src="/humidity.svg" alt="humidity" />
              <p> {weather.humidity}</p>
            </div>
            <div className="weatheritem">
              <img src="/pressure.svg" alt="humidity" />
              <p> {weather.pressure}</p>
            </div>
            <div className="weatheritem">
              <img src="/wind.svg" alt="wind" />
              <p>{weather.wind}</p>
            </div>
            <div className="weatheritem">
              <img src="/visibility.svg" alt="visibility" />
              <p>{weather.visibility}</p>
            </div>
          </div>
        </div>
        <div className="path-container">
          <input
            type="text"
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
            }}
          />
          <input
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
            }}
          />
        </div>
        <div className="health-check">
          <img src="/health.svg" alt="health" />
          <h3>Health Check</h3>
          <p>Fuel: {flightData.fuel}</p>
          <p>Engine: {flightData.engine}</p>
        </div>
      </div>
      <ToastContainer toastStyle={{ backgroundColor: "#000" }} />
    </div>
  );
}

export default App;
