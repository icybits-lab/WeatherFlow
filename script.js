// Weather Dashboard Application
document.addEventListener('DOMContentLoaded', function() {
    // API Configuration
    const API_KEY = '2329622a5dc7da3750966be9c7c807c3'; // Replace with your actual API key
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';
    const GEO_URL = 'http://api.openweathermap.org/geo/1.0';
    
    // Fallback cities for suggestions
    const POPULAR_CITIES = [
        'London', 'New York', 'Tokyo', 'Paris', 'Sydney',
        'Dubai', 'Singapore', 'Hong Kong', 'Bangkok', 'Istanbul',
        'Dhaka', 'Mumbai', 'Shanghai', 'Moscow', 'Berlin'
    ];
    
    // DOM Elements
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const locationBtn = document.getElementById('locationBtn');
    const suggestionsDropdown = document.getElementById('suggestions');
    const recentCitiesContainer = document.getElementById('recentCities');
    const themeToggle = document.getElementById('themeToggle');
    const unitsToggle = document.getElementById('unitsToggle');
    const refreshData = document.getElementById('refreshData');
    const loadingModal = document.getElementById('loadingModal');
    const aboutModal = document.getElementById('aboutModal');
    const aboutBtn = document.getElementById('aboutBtn');
    
    // Current weather elements
    const currentCity = document.getElementById('currentCity');
    const currentDateTime = document.getElementById('currentDateTime');
    const currentIcon = document.getElementById('currentIcon');
    const currentCondition = document.getElementById('currentCondition');
    const currentTemp = document.getElementById('currentTemp');
    const minTemp = document.getElementById('minTemp');
    const maxTemp = document.getElementById('maxTemp');
    const feelsLike = document.getElementById('feelsLike');
    const windSpeed = document.getElementById('windSpeed');
    const humidity = document.getElementById('humidity');
    const pressure = document.getElementById('pressure');
    const visibility = document.getElementById('visibility');
    const clouds = document.getElementById('clouds');
    const uvi = document.getElementById('uvi');
    const sunrise = document.getElementById('sunrise');
    const sunset = document.getElementById('sunset');
    const dayLength = document.getElementById('dayLength');
    const lastUpdate = document.getElementById('lastUpdate');
    
    // Forecast elements
    const hourlyForecast = document.getElementById('hourlyForecast');
    const hourlyRange = document.getElementById('hourlyRange');
    const dailyForecast = document.getElementById('dailyForecast');
    
    // Air quality elements
    const aqiValue = document.getElementById('aqiValue');
    const aqiLevel = document.getElementById('aqiLevel');
    const aqiIndicator = document.getElementById('aqiIndicator');
    const pm25 = document.getElementById('pm25');
    const pm10 = document.getElementById('pm10');
    const o3 = document.getElementById('o3');
    const no2 = document.getElementById('no2');
    const so2 = document.getElementById('so2');
    const co = document.getElementById('co');
    
    // Alerts elements
    const alertsContainer = document.getElementById('alertsContainer');
    
    // Map elements
    const mapLayerBtns = document.querySelectorAll('.map-layer-btn');
    
    // State
    let currentLocation = {
        lat: null,
        lon: null,
        city: 'London',
        country: 'GB'
    };
    
    let units = 'metric'; // 'metric' or 'imperial'
    let isDarkTheme = false;
    let recentCities = JSON.parse(localStorage.getItem('weatherRecentCities')) || ['London', 'New York', 'Tokyo'];
    let weatherData = null;
    
    // Unit conversions
    const unitConfig = {
        metric: {
            temp: '°C',
            speed: 'km/h',
            distance: 'km',
            pressure: 'hPa'
        },
        imperial: {
            temp: '°F',
            speed: 'mph',
            distance: 'miles',
            pressure: 'inHg'
        }
    };
    
    // Weather icon mapping
    const weatherIcons = {
        '01d': 'fas fa-sun',           // clear sky day
        '01n': 'fas fa-moon',          // clear sky night
        '02d': 'fas fa-cloud-sun',     // few clouds day
        '02n': 'fas fa-cloud-moon',    // few clouds night
        '03d': 'fas fa-cloud',         // scattered clouds
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',         // broken clouds
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',    // shower rain
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',// rain day
        '10n': 'fas fa-cloud-moon-rain',// rain night
        '11d': 'fas fa-bolt',          // thunderstorm
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',     // snow
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',          // mist
        '50n': 'fas fa-smog'
    };
    
    // Initialize the app
    function init() {
        loadSettings();
        updateRecentCities();
        setDefaultCity();
        loadWeatherData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Update time every minute
        updateDateTime();
        setInterval(updateDateTime, 60000);
    }
    
    // Load saved settings
    function loadSettings() {
        const savedUnits = localStorage.getItem('weatherUnits');
        const savedTheme = localStorage.getItem('weatherTheme');
        
        if (savedUnits) units = savedUnits;
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            isDarkTheme = true;
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        updateUnitsDisplay();
    }
    
    // Set default city from localStorage or use London
    function setDefaultCity() {
        const savedCity = localStorage.getItem('lastCity');
        if (savedCity) {
            currentLocation.city = savedCity;
        }
    }
    
    // Update recent cities display
    function updateRecentCities() {
        recentCitiesContainer.innerHTML = '';
        recentCities.forEach(city => {
            const tag = document.createElement('span');
            tag.className = 'recent-tag';
            tag.textContent = city;
            tag.addEventListener('click', () => {
                cityInput.value = city;
                searchWeather(city);
            });
            recentCitiesContainer.appendChild(tag);
        });
    }
    
    // Add city to recent searches
    function addToRecentCities(city) {
        // Remove if already exists
        recentCities = recentCities.filter(c => c.toLowerCase() !== city.toLowerCase());
        
        // Add to beginning
        recentCities.unshift(city);
        
        // Keep only last 5 cities
        if (recentCities.length > 5) {
            recentCities.pop();
        }
        
        // Save to localStorage
        localStorage.setItem('weatherRecentCities', JSON.stringify(recentCities));
        updateRecentCities();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Search button
        searchBtn.addEventListener('click', () => {
            const city = cityInput.value.trim();
            if (city) {
                searchWeather(city);
            }
        });
        
        // Enter key in search input
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = cityInput.value.trim();
                if (city) {
                    searchWeather(city);
                }
            }
        });
        
        // Location button
        locationBtn.addEventListener('click', getCurrentLocation);
        
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);
        
        // Units toggle
        unitsToggle.addEventListener('click', toggleUnits);
        
        // Refresh data
        refreshData.addEventListener('click', () => {
            if (currentLocation.city) {
                loadWeatherData();
            }
        });
        
        // About modal
        aboutBtn.addEventListener('click', () => {
            aboutModal.classList.add('active');
        });
        
        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                aboutModal.classList.remove('active');
            });
        });
        
        // Close modal on outside click
        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                aboutModal.classList.remove('active');
            }
        });
        
        // Map layer buttons
        mapLayerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                mapLayerBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateWeatherMap(btn.dataset.layer);
            });
        });
        
        // Input suggestions
        cityInput.addEventListener('input', showSuggestions);
        cityInput.addEventListener('focus', showSuggestions);
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!cityInput.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
                suggestionsDropdown.classList.remove('active');
            }
        });
    }
    
    // Show city suggestions
    function showSuggestions() {
        const query = cityInput.value.toLowerCase();
        if (!query) {
            suggestionsDropdown.innerHTML = '';
            suggestionsDropdown.classList.remove('active');
            return;
        }
        
        // Filter popular cities
        const filtered = POPULAR_CITIES.filter(city => 
            city.toLowerCase().includes(query)
        ).slice(0, 8);
        
        if (filtered.length === 0) {
            suggestionsDropdown.classList.remove('active');
            return;
        }
        
        suggestionsDropdown.innerHTML = filtered.map(city => `
            <div class="suggestion-item" data-city="${city}">
                <i class="fas fa-city"></i> ${city}
            </div>
        `).join('');
        
        suggestionsDropdown.classList.add('active');
        
        // Add click event to suggestions
        suggestionsDropdown.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const city = item.dataset.city;
                cityInput.value = city;
                searchWeather(city);
                suggestionsDropdown.classList.remove('active');
            });
        });
    }
    
    // Search weather for a city
    async function searchWeather(city) {
        showLoading();
        
        try {
            // First, get coordinates for the city
            const geoResponse = await fetch(`${GEO_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
            
            if (!geoResponse.ok) {
                throw new Error('City not found');
            }
            
            const geoData = await geoResponse.json();
            
            if (geoData.length === 0) {
                throw new Error('City not found');
            }
            
            // Update current location
            currentLocation = {
                lat: geoData[0].lat,
                lon: geoData[0].lon,
                city: geoData[0].name,
                country: geoData[0].country
            };
            
            // Save last city
            localStorage.setItem('lastCity', currentLocation.city);
            
            // Add to recent cities
            addToRecentCities(currentLocation.city);
            
            // Load weather data
            await loadWeatherData();
            
        } catch (error) {
            console.error('Error searching city:', error);
            alert(`Error: ${error.message}. Please try another city.`);
        } finally {
            hideLoading();
        }
    }
    
    // Get current location
    function getCurrentLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        
        showLoading();
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    currentLocation.lat = position.coords.latitude;
                    currentLocation.lon = position.coords.longitude;
                    
                    // Get city name from coordinates
                    const geoResponse = await fetch(
                        `${GEO_URL}/reverse?lat=${currentLocation.lat}&lon=${currentLocation.lon}&limit=1&appid=${API_KEY}`
                    );
                    
                    if (geoResponse.ok) {
                        const geoData = await geoResponse.json();
                        if (geoData.length > 0) {
                            currentLocation.city = geoData[0].name;
                            currentLocation.country = geoData[0].country;
                            
                            // Update input
                            cityInput.value = currentLocation.city;
                            
                            // Add to recent cities
                            addToRecentCities(currentLocation.city);
                        }
                    }
                    
                    await loadWeatherData();
                    
                } catch (error) {
                    console.error('Error getting location:', error);
                    alert('Error getting your location. Please try again.');
                } finally {
                    hideLoading();
                }
            },
            (error) => {
                hideLoading();
                alert('Unable to retrieve your location. Please check your location settings.');
                console.error('Geolocation error:', error);
            }
        );
    }
    
    // Load all weather data
    async function loadWeatherData() {
        if (!currentLocation.lat || !currentLocation.lon) {
            // Try to get coordinates for current city
            await searchWeather(currentLocation.city);
            return;
        }
        
        showLoading();
        
        try {
            // Fetch all data in parallel
            const [currentData, forecastData, airQualityData] = await Promise.all([
                fetchWeatherData(),
                fetchForecastData(),
                fetchAirQualityData()
            ]);
            
            weatherData = {
                current: currentData,
                forecast: forecastData,
                airQuality: airQualityData
            };
            
            // Update UI with new data
            updateCurrentWeather();
            updateHourlyForecast();
            updateDailyForecast();
            updateAirQuality();
            updateWeatherAlerts();
            updateWeatherMap('temp');
            
            // Update last update time
            updateLastUpdate();
            
        } catch (error) {
            console.error('Error loading weather data:', error);
            alert('Error loading weather data. Please try again.');
        } finally {
            hideLoading();
        }
    }
    
    // Fetch current weather data
    async function fetchWeatherData() {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}&units=${units}&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        return await response.json();
    }
    
    // Fetch 5-day forecast
    async function fetchForecastData() {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}&units=${units}&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        return await response.json();
    }
    
    // Fetch air quality data
    async function fetchAirQualityData() {
        const response = await fetch(
            `${BASE_URL}/air_pollution?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch air quality data');
        }
        
        return await response.json();
    }
    
    // Update current weather display
    function updateCurrentWeather() {
        if (!weatherData?.current) return;
        
        const data = weatherData.current;
        
        // City and country
        currentCity.textContent = `${data.name}, ${data.sys.country}`;
        
        // Temperature
        const temp = Math.round(data.main.temp);
        currentTemp.textContent = temp;
        
        // Min/Max temperatures
        const tempMin = Math.round(data.main.temp_min);
        const tempMax = Math.round(data.main.temp_max);
        minTemp.textContent = `${tempMin}°`;
        maxTemp.textContent = `${tempMax}°`;
        
        // Feels like
        const feelsLikeTemp = Math.round(data.main.feels_like);
        feelsLike.textContent = `${feelsLikeTemp}°`;
        
        // Weather condition
        const condition = data.weather[0].description;
        currentCondition.textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
        
        // Weather icon
        const iconCode = data.weather[0].icon;
        currentIcon.innerHTML = `<i class="${weatherIcons[iconCode] || 'fas fa-cloud'}"></i>`;
        
        // Other details
        windSpeed.textContent = `${data.wind.speed} ${unitConfig[units].speed}`;
        humidity.textContent = `${data.main.humidity}%`;
        pressure.textContent = `${data.main.pressure} ${unitConfig[units].pressure}`;
        
        // Visibility (convert meters to km/miles)
        const visibilityValue = units === 'metric' 
            ? (data.visibility / 1000).toFixed(1)
            : (data.visibility / 1609).toFixed(1);
        visibility.textContent = `${visibilityValue} ${unitConfig[units].distance}`;
        
        clouds.textContent = `${data.clouds.all}%`;
        
        // Sunrise and sunset
        const sunriseTime = formatTime(data.sys.sunrise * 1000, data.timezone);
        const sunsetTime = formatTime(data.sys.sunset * 1000, data.timezone);
        
        sunrise.textContent = sunriseTime;
        sunset.textContent = sunsetTime;
        
        // Calculate day length
        const dayLengthMs = data.sys.sunset * 1000 - data.sys.sunrise * 1000;
        const dayLengthHours = Math.floor(dayLengthMs / (1000 * 60 * 60));
        const dayLengthMinutes = Math.floor((dayLengthMs % (1000 * 60 * 60)) / (1000 * 60));
        dayLength.textContent = `${dayLengthHours}h ${dayLengthMinutes}m`;
        
        // UV Index (would need separate API call)
        uvi.textContent = '--';
    }
    
    // Update hourly forecast
    function updateHourlyForecast() {
        if (!weatherData?.forecast) return;
        
        const forecastList = weatherData.forecast.list;
        const now = new Date();
        
        // Clear loading state
        hourlyForecast.innerHTML = '';
        
        // Get next 24 hours (8 forecast points, 3-hour intervals)
        const hourlyData = forecastList.slice(0, 8);
        
        hourlyData.forEach((item, index) => {
            const forecastTime = new Date(item.dt * 1000);
            const isCurrent = index === 0;
            
            const hourItem = document.createElement('div');
            hourItem.className = `hour-item ${isCurrent ? 'current' : ''}`;
            
            // Time
            const timeStr = isCurrent ? 'Now' : formatTime(forecastTime.getTime(), weatherData.forecast.city.timezone);
            
            // Temperature
            const temp = Math.round(item.main.temp);
            
            // Weather icon
            const iconCode = item.weather[0].icon;
            const iconClass = weatherIcons[iconCode] || 'fas fa-cloud';
            
            // Condition
            const condition = item.weather[0].description;
            
            hourItem.innerHTML = `
                <span class="hour-time">${timeStr}</span>
                <div class="hour-icon"><i class="${iconClass}"></i></div>
                <span class="hour-temp">${temp}°</span>
                <span class="hour-condition">${condition}</span>
            `;
            
            hourlyForecast.appendChild(hourItem);
        });
        
        // Update range text
        const startTime = new Date(hourlyData[0].dt * 1000);
        const endTime = new Date(hourlyData[hourlyData.length - 1].dt * 1000);
        hourlyRange.textContent = `${formatTime(startTime.getTime(), weatherData.forecast.city.timezone, 'short')} - ${formatTime(endTime.getTime(), weatherData.forecast.city.timezone, 'short')}`;
    }
    
    // Update daily forecast
    function updateDailyForecast() {
        if (!weatherData?.forecast) return;
        
        const forecastList = weatherData.forecast.list;
        const dailyForecastMap = new Map();
        
        // Group forecast by day
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();
            
            if (!dailyForecastMap.has(dayKey)) {
                dailyForecastMap.set(dayKey, {
                    date,
                    temps: [],
                    conditions: [],
                    icons: []
                });
            }
            
            const dayData = dailyForecastMap.get(dayKey);
            dayData.temps.push(item.main.temp);
            dayData.conditions.push(item.weather[0].description);
            dayData.icons.push(item.weather[0].icon);
        });
        
        // Convert to array and get next 5 days
        const dailyData = Array.from(dailyForecastMap.values())
            .slice(0, 5);
        
        // Clear loading state
        dailyForecast.innerHTML = '';
        
        dailyData.forEach(day => {
            // Calculate min and max temps
            const minTemp = Math.round(Math.min(...day.temps));
            const maxTemp = Math.round(Math.max(...day.temps));
            
            // Get most common condition for the day
            const mostCommonCondition = getMostCommon(day.conditions);
            const mostCommonIcon = getMostCommon(day.icons);
            
            const dayItem = document.createElement('div');
            dayItem.className = 'day-item';
            
            // Format date
            const dateStr = formatDate(day.date);
            
            dayItem.innerHTML = `
                <span class="day-date">${dateStr}</span>
                <div class="day-icon"><i class="${weatherIcons[mostCommonIcon] || 'fas fa-cloud'}"></i></div>
                <span class="day-condition">${mostCommonCondition}</span>
                <div class="day-temp-range">
                    <span class="day-temp high">${maxTemp}°</span>
                    <span class="day-temp low">${minTemp}°</span>
                </div>
            `;
            
            dailyForecast.appendChild(dayItem);
        });
    }
    
    // Update air quality display
    function updateAirQuality() {
        if (!weatherData?.airQuality) return;
        
        const aqData = weatherData.airQuality.list[0];
        const aqi = aqData.main.aqi;
        
        // AQI levels: 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
        const aqiLevels = {
            1: { text: 'Good', color: '#00e400', position: '10%' },
            2: { text: 'Fair', color: '#ffff00', position: '30%' },
            3: { text: 'Moderate', color: '#ff7e00', position: '50%' },
            4: { text: 'Poor', color: '#ff0000', position: '70%' },
            5: { text: 'Very Poor', color: '#8f3f97', position: '90%' }
        };
        
        const level = aqiLevels[aqi];
        
        // Update AQI value and level
        aqiValue.textContent = aqi;
        aqiLevel.textContent = level.text;
        aqiLevel.style.backgroundColor = level.color;
        
        // Update indicator position
        aqiIndicator.style.left = level.position;
        aqiIndicator.style.backgroundColor = level.color;
        
        // Update pollutant values
        const components = aqData.components;
        pm25.textContent = `${components.pm2_5.toFixed(1)} μg/m³`;
        pm10.textContent = `${components.pm10.toFixed(1)} μg/m³`;
        o3.textContent = `${components.o3.toFixed(1)} μg/m³`;
        no2.textContent = `${components.no2.toFixed(1)} μg/m³`;
        so2.textContent = `${components.so2.toFixed(1)} μg/m³`;
        co.textContent = `${components.co.toFixed(1)} μg/m³`;
    }
    
    // Update weather alerts
    function updateWeatherAlerts() {
        // OpenWeatherMap doesn't provide free alerts, so we'll show a placeholder
        // In a real app, you would fetch from OpenWeatherMap One Call API or another service
        alertsContainer.innerHTML = `
            <div class="no-alerts">
                <i class="fas fa-check-circle"></i>
                <p>No active weather alerts for ${currentLocation.city}</p>
            </div>
        `;
    }
    
    // Update weather map
    function updateWeatherMap(layer) {
        const mapContainer = document.getElementById('weatherMap');
        
        // In a real implementation, you would integrate with Leaflet.js or Google Maps
        // For this demo, we'll show a placeholder with layer info
        mapContainer.innerHTML = `
            <div class="map-info">
                <i class="fas fa-globe-americas"></i>
                <p>Showing ${layer} map for ${currentLocation.city}</p>
                <small>Weather map integration would show here with real data</small>
            </div>
        `;
    }
    
    // Update date and time
    function updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC' // Would need timezone from API
        };
        
        currentDateTime.textContent = now.toLocaleDateString('en-US', options);
    }
    
    // Update last update time
    function updateLastUpdate() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        lastUpdate.textContent = timeStr;
    }
    
    // Toggle theme
    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('dark-theme');
        
        const icon = themeToggle.querySelector('i');
        if (isDarkTheme) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('weatherTheme', 'dark');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('weatherTheme', 'light');
        }
    }
    
    // Toggle units
    function toggleUnits() {
        units = units === 'metric' ? 'imperial' : 'metric';
        localStorage.setItem('weatherUnits', units);
        
        updateUnitsDisplay();
        
        // Reload weather data with new units
        if (weatherData) {
            loadWeatherData();
        }
    }
    
    // Update units display
    function updateUnitsDisplay() {
        const tempUnit = unitConfig[units].temp;
        document.querySelectorAll('.temp-unit').forEach(el => {
            el.textContent = tempUnit;
        });
    }
    
    // Show loading modal
    function showLoading() {
        loadingModal.classList.add('active');
    }
    
    // Hide loading modal
    function hideLoading() {
        loadingModal.classList.remove('active');
    }
    
    // Helper function: Format time
    function formatTime(timestamp, timezone, format = 'short') {
        const date = new Date(timestamp + (timezone || 0) * 1000);
        
        if (format === 'short') {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric',
                hour12: true
            });
        }
        
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    
    // Helper function: Format date
    function formatDate(date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }
    }
    
    // Helper function: Get most common element in array
    function getMostCommon(arr) {
        const counts = {};
        let maxCount = 0;
        let mostCommon = arr[0];
        
        arr.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
            if (counts[item] > maxCount) {
                maxCount = counts[item];
                mostCommon = item;
            }
        });
        
        return mostCommon;
    }
    
    // Initialize the app
    init();
});