import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDPlfj1T6Ajv7m3mH7N-hEEDuePdS0s65Q",
    authDomain: "eedanemoolu10.firebaseapp.com",
    databaseURL: "https://eedanemoolu10-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "eedanemoolu10",
    storageBucket: "eedanemoolu10.appspot.com",
    messagingSenderId: "382971413134",
    appId: "1:382971413134:web:9bb668c4c6b53fbd763fdf",
    measurementId: "G-3655XKG0KD"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore();
  
  // Initialize Leaflet map
  const map = L.map("map").setView([13.0102, 74.7942], 17);
  const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://maps.app.goo.gl/vBzqh3QTS7W3Pqfw6">OpenStreetMap</a>',
  }).addTo(map);
  
function getRoute(eventLatitude, eventLongitude) {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLatitude = position.coords.latitude;
        const userLongitude = position.coords.longitude;

        const startPoint = L.latLng(userLatitude, userLongitude);
        const endPoint = L.latLng(eventLatitude, eventLongitude);

        // Clear existing routes before adding a new one
        map.eachLayer((layer) => {
          if (layer instanceof L.Polyline) {
            map.removeLayer(layer);
          }
        });

        // Add a new route to the map
        L.Routing.control({
          waypoints: [startPoint, endPoint],
          routeWhileDragging: true,
        }).addTo(map);
      },
      (error) => {
        // Handle error or user denying location access
        console.error("Error getting user location:", error.message);
        alert("Unable to retrieve your location. Please enable location services.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser");
  }
}
  
  // Function to add a marker with popup for an event
  function addEventMarker(event) {
    const { latitude, longitude } = event.location;
    const eventMarker = L.marker([latitude, longitude]).addTo(map);
    const popupContent = `
      Event: ${event.eventName}<br>
      Date: ${event.eventDate}<br>
      Time: ${event.eventTime}<br>
      Description: ${event.eventDescription}<br>
      <button class="route-button">Get Route</button>
    `;
    eventMarker.bindPopup(popupContent);
  
    // Add event listener to the button
    eventMarker.on("popupopen", () => {
      const routeButton = document.querySelector(".route-button");
      routeButton.addEventListener("click", () => {
        getRoute(latitude, longitude);
      });
    });
  }
  

  async function displayEvents() {
    const eventsCollection = collection(db, "events");
    const eventsSnapshot = await getDocs(eventsCollection);
  
    eventsSnapshot.forEach(async (eventDoc) => {
      const eventData = eventDoc.data();
      const locationRef = eventData.location;
  
      // Check if the location reference is valid
      if (locationRef) {
        try {
          // Fetch location details from the referenced document
          const locationDoc = await getDoc(locationRef);
  
          // Check if the location document exists
          if (locationDoc.exists()) {
            const locationData = locationDoc.data();
  
            // Combine event and location data and add a marker
            const eventWithLocation = { ...eventData, location: locationData };
            addEventMarker(eventWithLocation);
          } else {
            console.error("Location document does not exist:", locationRef.id);
          }
        } catch (error) {
          console.error("Error fetching location document:", error);
        }
      } else {
        console.error("Invalid location reference:", locationRef);
      }
    });
  }
  
  // Call the function to display events on the map
  displayEvents();
  
