// Auto-refresh Breaking News Ticker
document.addEventListener("DOMContentLoaded", function () {
    const ticker = document.querySelector(".breaking-news marquee");
    ticker.innerHTML = "🚨 Breaking News: New Updates Every Minute! Stay Tuned 🚨";
});
document.getElementById('contact-link').addEventListener('click', function(event) {
    event.preventDefault();  // Prevent the default link behavior
    const footer = document.getElementById('footer');
    
    // Scroll smoothly to the footer
    footer.scrollIntoView({
        behavior: 'smooth'  // Smooth scroll to footer
    });
});
let lastScrollTop = 0; // Variable to keep track of the last scroll position
const header = document.querySelector('header');
const navBar = document.querySelector('.nav-bar');

window.addEventListener('scroll', function() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    if (currentScroll > lastScrollTop) {
        // Scrolling down
        header.style.top = '-60px';  // Move header up
        navBar.style.top = '-60px';  // Move nav-bar up (hidden)
    } else {
        // Scrolling up
        header.style.top = '0';      // Bring header back down
        navBar.style.top = '60px';   // Bring nav-bar back below the header
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative scroll
});
// NEWSLETTER FORM SUBMISSION
document.getElementById("newsletter-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    alert("Thank you for subscribing! Updates will be sent to " + email);
    document.getElementById("email").value = "";
});
document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default anchor behavior
        const sectionId = this.getAttribute('data-section');
        const section = document.getElementById(sectionId);
        
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// weather
const apiKey = "3fcd1d33745f573bf4ae7d9f58f7e85a"; 
let hourlyChartInstance = null;
let dailyChartInstance = null;

// Capital Cities for Countries
const capitalCities = {
    "USA": "Washington",
    "United States": "Washington",
    "India": "New Delhi",
    "Japan": "Tokyo",
    "France": "Paris",
    "Germany": "Berlin",
    "UK": "London",
    "United Kingdom": "London",
    "Canada": "Ottawa",
    "Australia": "Canberra",
    "Russia": "Moscow",
    "China": "Beijing",
    "Brazil": "Brasilia",
    "South Korea": "Seoul",
    "Italy": "Rome",
    "Spain": "Madrid"
};

// Fetch Weather Data
async function getWeather(cityOrCountry = null, lat = null, lon = null) {
    let apiUrl;
    if (!cityOrCountry && lat === null && lon === null) {
        cityOrCountry = document.getElementById("city").value.trim();
    }

    if (!cityOrCountry && lat === null && lon === null) {
        alert("Please enter a city or country name.");
        return;
    }

    // If country name is entered, use its capital
    if (capitalCities[cityOrCountry]) {
        cityOrCountry = capitalCities[cityOrCountry];
    }

    if (lat !== null && lon !== null) {
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrCountry}&appid=${apiKey}&units=metric`;
    }

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod !== 200) {
            alert("Location not found!");
            return;
        }

        // Update Weather Details
        document.getElementById("location").innerText = `${data.name}, ${data.sys.country}`;
        document.getElementById("temperature").innerText = data.main.temp;
        document.getElementById("feels_like").innerText = data.main.feels_like;
        document.getElementById("humidity").innerText = data.main.humidity;
        document.getElementById("wind").innerText = data.wind.speed;
        document.getElementById("pressure").innerText = data.main.pressure;
        document.getElementById("sunrise").innerText = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        document.getElementById("sunset").innerText = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        document.getElementById("description").innerText = data.weather[0].description;

        // Update Enhanced Weather Icons Based on Time of Day
        updateWeatherIcon(data.weather[0].icon, data.sys.sunrise, data.sys.sunset, data.dt);

        // Fetch Additional Data
        getAirQuality(data.coord.lat, data.coord.lon);
        getUVIndex(data.coord.lat, data.coord.lon);
        getForecast(data.coord.lat, data.coord.lon);

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Enhanced Weather Icon Based on Day/Night
function updateWeatherIcon(iconCode, sunrise, sunset, currentTime) {
    let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    // Check if it's night time
    if (currentTime < sunrise || currentTime > sunset) {
        iconUrl = iconUrl.replace("d", "n");
    }

    document.getElementById("weather-icon").src = iconUrl;
}

// Fetch Air Quality Index (AQI)
async function getAirQuality(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        document.getElementById("aqi").innerText = data.list[0].main.aqi;
    } catch (error) {
        console.error("Error fetching AQI:", error);
    }
}

// Fetch UV Index
async function getUVIndex(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        document.getElementById("uv").innerText = data.value;
    } catch (error) {
        console.error("Error fetching UV Index:", error);
    }
}

// Fetch 24-Hour & 5-Day Forecast
async function getForecast(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        const labels = data.list.map(item => new Date(item.dt * 1000).getHours() + ":00");
        const temps = data.list.map(item => item.main.temp);

        updateChart("hourlyChart", labels.slice(0, 8), temps.slice(0, 8), "24-Hour Forecast");
        updateChart("dailyChart", labels.filter((_, i) => i % 8 === 0), temps.filter((_, i) => i % 8 === 0), "5-Day Forecast");
    } catch (error) {
        console.error("Error fetching forecast:", error);
    }
}

// Update Chart.js Graphs
function updateChart(canvasId, labels, data, label) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} not found`);
        return;
    }

    const ctx = canvas.getContext("2d");

    if (canvasId === "hourlyChart" && hourlyChartInstance) hourlyChartInstance.destroy();
    if (canvasId === "dailyChart" && dailyChartInstance) dailyChartInstance.destroy();

    const chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: "#ff9800",
                backgroundColor: "rgba(255, 152, 0, 0.2)",
                borderWidth: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    if (canvasId === "hourlyChart") hourlyChartInstance = chartInstance;
    if (canvasId === "dailyChart") dailyChartInstance = chartInstance;
}

// Auto-detect location or default to India (Delhi)
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => getWeather(null, position.coords.latitude, position.coords.longitude),
            () => getWeather("Delhi")
        );
    } else {
        getWeather("Delhi");
    }
}

// mail submission 
document.getElementById("newsletter-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevents page reload
    let emailInput = document.getElementById("email");
    let email = emailInput.value.trim();
    let errorMessage = document.getElementById("email-error");
    let errorText = document.getElementById("error-text");

    // Email validation
    if (email === "") {
        errorText.textContent = "Please re try at Home page";
        errorMessage.style.display = "flex";
        emailInput.style.border = "1px solid rgb(86, 255, 77)";
    } else if (!email.includes("@")) {
        errorText.textContent = "Invalid email! '@' is missing.";
        errorMessage.style.display = "flex";
        emailInput.style.border = "1px solid #ff4d4d";
    } else if (!email.includes(".")) {
        errorText.textContent = "Please enter a valid email (example@mail.com).";
        errorMessage.style.display = "flex";
        emailInput.style.border = "1px solid #ff4d4d";
    } else {
        errorMessage.style.display = "none"; // Hide error message
        emailInput.style.border = "1px solid #444"; // Reset border
        
        // Simulate subscription success
        alert("✅Subscribed successfully: " + email);
        emailInput.value = ""; // Clear input
    }
});
