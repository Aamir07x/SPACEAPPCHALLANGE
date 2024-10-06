const canvas = document.getElementById('orreryCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
let neos = [];
let selectedDate = '2024-09-23';

// Event listener for canvas clicks (added once)
canvas.addEventListener('click', (event) => {
  const canvasRect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - canvasRect.left;
  const mouseY = event.clientY - canvasRect.top;

  // Check if any NEO is clicked
  neos.forEach((neo) => {
    const x = centerX + neo.distance * Math.cos(neo.angle);
    const y = centerY + neo.distance * Math.sin(neo.angle);
    const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);

    if (dist < neo.diameter / 2) {
      displayNEOInfo(neo);
    }
  });
});

// Function to draw Earth and NEOs
function drawOrrery() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Earth at the center
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
  ctx.fillStyle = 'blue';
  ctx.fill();

  // Draw NEOs
  drawNEOs();
}

// Function to draw Near-Earth Objects (NEOs)
function drawNEOs() {
  neos.forEach((neo) => {
    // Extract the estimated size of the NEO (in meters)
    const diameter = (neo.estimated_diameter.meters.estimated_diameter_max + neo.estimated_diameter.meters.estimated_diameter_min) / 2;

    // Convert miss distance from kilometers to pixels for the visualization (example scale)
    const missDistance = parseFloat(neo.close_approach_data[0].miss_distance.kilometers);
    const distance = Math.min(missDistance / 100000, 150); // Limit the distance for visualization purposes

    // Random angle for placing the NEO around Earth
    const angle = Math.random() * 2 * Math.PI;

    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);

    // Store position and properties for click detection
    neo.distance = distance;
    neo.angle = angle;
    neo.diameter = diameter / 100;  // Scale down for better display on canvas

    // Draw NEO (circle size proportional to the NEO size)
    ctx.beginPath();
    ctx.arc(x, y, neo.diameter, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Draw NEO name, size, and distance near the NEO
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`Name: ${neo.name}`, x + 10, y);
    ctx.fillText(`Size: ${diameter.toFixed(1)} m`, x + 10, y + 15);
    ctx.fillText(`Dist: ${missDistance.toFixed(1)} km`, x + 10, y + 30);
  });
}

// Function to display NEO info on click
function displayNEOInfo(neo) {
  const neoInfoDiv = document.getElementById('neoInfo');
  neoInfoDiv.innerHTML = `
    <strong>Name:</strong> ${neo.name} <br>
    <strong>Approach Date:</strong> ${neo.close_approach_data[0].close_approach_date} <br>
    <strong>Miss Distance (km):</strong> ${neo.close_approach_data[0].miss_distance.kilometers} km <br>
    <strong>Velocity (km/h):</strong> ${neo.close_approach_data[0].relative_velocity.kilometers_per_hour} km/h <br>
    <strong>Size (meters):</strong> ${neo.estimated_diameter.meters.estimated_diameter_max.toFixed(1)} m
  `;
}

// Fetch NEO data from NASA NeoWs API
async function fetchNEOData(date) {
  const apiKey = '6nmrKNrIFXFsVC2FaW9dy1z7zdHGKncG8lDcZm3w'; // NASA API key
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    neos = data.near_earth_objects[date];
    drawOrrery();  // Redraw the orrery with updated NEO data
  } catch (error) {
    console.error('Error fetching NEO data:', error);
  }
}

// Update NEOs for a selected date
function updateNEOs() {
  const dateInput = document.getElementById('date').value;
  selectedDate = dateInput;
  fetchNEOData(selectedDate);
}

// Initialize the Orrery
fetchNEOData(selectedDate);
