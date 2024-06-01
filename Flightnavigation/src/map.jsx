import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import {
  TileLayer,
  MapContainer,
  LayersControl,
  Marker,
  ZoomControl,
} from "react-leaflet";
import { toast } from "react-toastify";
// import { Button } from "@material-ui/core";

// Import the JS and CSS:
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import { io } from "socket.io-client";

import marker from "./plane.svg";
import way_marker from "./map-marker.svg";
import axios from "axios";
const myIcon = new L.Icon({
  iconUrl: marker,
  iconRetinaUrl: marker,
  popupAnchor: [-0, -0],
  iconSize: [32, 45],
});

const waypointMarker = new L.Icon({
  iconUrl: way_marker,
  iconRetinaUrl: way_marker,
  popupAnchor: [-0, -0],
  iconSize: [32, 45],
});

const maps = {
  base: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
};

const Map = ({ waypoints, planeposition }) => {
  const [map, setMap] = useState(null);

  // State vars for our routing machine instance:
  const [routingMachine, setRoutingMachine] = useState(null);

  // Start-End points for the routing machine:

  // Ref for our routing machine instace:
  const RoutingMachineRef = useRef(null);

  // Create the routing-machine instance:
  useEffect(() => {
    // Check For the map instance:
    if (!map) return;
    if (map) {
      // Assign Control to React Ref:
      RoutingMachineRef.current = L.Routing.control({
        position: "topleft", // Where to position control on map
        lineOptions: {
          // Options for the routing line
          styles: [
            {
              color: "#757de8",
            },
          ],
        },
        waypoints: waypoints, // Point A - Point B
        // createMarker: function (i, waypoint, n) {
        //   return L.marker(waypoint.latLng, {
        //     icon: waypointMarker,
        //   });
        // },
      });
      // Save instance to state:
      setRoutingMachine(RoutingMachineRef.current);
    }
  }, [map]);

  useEffect(() => {
    if (RoutingMachineRef?.current) {
      RoutingMachineRef?.current?.setWaypoints(waypoints);
    }
  }, [waypoints]);

  // Once routing machine instance is ready, add to map:
  useEffect(() => {
    if (!routingMachine) return;
    if (routingMachine) {
      routingMachine.addTo(map);
    }
  }, [routingMachine]);

  return (
    <>
      <button variant="contained" color="default">
        Click To Change Waypoints
      </button>
      <MapContainer
        center={[37.0902, -95.7129]}
        zoom={3}
        zoomControl={false}
        style={{ height: "100vh", width: "100%", padding: 0 }}
        // Set the map instance to state when ready:
        // whenCreated={(map) => setMap(map)}
        ref={setMap}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Map">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url={maps.base}
            />
            <Marker position={planeposition} icon={myIcon} />
            <ZoomControl position="topright" />
          </LayersControl.BaseLayer>
        </LayersControl>
      </MapContainer>
    </>
  );
};

export default Map;
