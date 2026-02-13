// Weather Dashboard Application
document.addEventListener('DOMContentLoaded', function() {
    const API_KEY = window.CONFIG ? window.CONFIG.OPENWEATHER_API_KEY : null;
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';
    const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
    
    if (!API_KEY) {
        showApiKeyError();
        return;
    }
    
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
    const aqiDescription = document.getElementById('aqiDescription');
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
    const weatherMap = document.getElementById('weatherMap');
    
    // State
    let currentLocation = {
        lat: 51.5074,
        lon: -0.1278,
        city: 'London',
        country: 'GB'
    };
    
    let units = 'metric';
    let isDarkTheme = false;
    let recentCities = JSON.parse(localStorage.getItem('weatherRecentCities')) || ['London', 'New York', 'Tokyo'];
    let weatherData = null;
    let map = null;
    let mapLayer = null;
    
    // Unit conversions
    const unitConfig = {
        metric: {
            temp: '°C',
            speed: 'm/s',
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
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    
    // Show API key error message
    function showApiKeyError() {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'api-key-error';
        errorContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 9999;
            text-align: center;
            max-width: 500px;
        `;
        
        errorContainer.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f39c12; margin-bottom: 20px;"></i>
            <h2 style="margin-bottom: 15px; color: #333;">API Key Not Configured</h2>
            <p style="margin-bottom: 20px; color: #666;">Please create a <code>config.js</code> file with your OpenWeatherMap API key.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: left;">
                <pre style="margin: 0; color: #333;">
// config.js
const CONFIG = {
    OPENWEATHER_API_KEY: 'your_api_key_here'
};</pre>
            </div>
            <p style="margin-bottom: 20px; color: #666;">
                Get your free API key from 
                <a href="https://openweathermap.org/api" target="_blank" style="color: #3498db;">OpenWeatherMap</a>
            </p>
            <button onclick="this.parentElement.remove()" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 10px 30px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            ">Got it</button>
        `;
        
        document.body.appendChild(errorContainer);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
        `;
        overlay.id = 'error-overlay';
        document.body.appendChild(overlay);
        
        errorContainer.querySelector('button').addEventListener('click', () => {
            overlay.remove();
        });
    }
    
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
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }
        
        updateUnitsDisplay();
    }
    
    // Set default city from localStorage or use London
    function setDefaultCity() {
        const savedCity = localStorage.getItem('lastCity');
        if (savedCity) {
            currentLocation.city = savedCity;
        }
        
        if (cityInput) {
            cityInput.value = currentLocation.city;
        }
    }
    
    // Update recent cities display
    function updateRecentCities() {
        if (!recentCitiesContainer) return;
        
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
        recentCities = recentCities.filter(c => c.toLowerCase() !== city.toLowerCase());
        recentCities.unshift(city);
        
        if (recentCities.length > 5) {
            recentCities.pop();
        }
        
        localStorage.setItem('weatherRecentCities', JSON.stringify(recentCities));
        updateRecentCities();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const city = cityInput.value.trim();
                if (city) searchWeather(city);
            });
        }
        
        if (cityInput) {
            cityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const city = cityInput.value.trim();
                    if (city) searchWeather(city);
                }
            });
        }
        
        if (locationBtn) {
            locationBtn.addEventListener('click', getCurrentLocation);
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        if (unitsToggle) {
            unitsToggle.addEventListener('click', toggleUnits);
        }
        
        if (refreshData) {
            refreshData.addEventListener('click', () => {
                if (currentLocation.city) loadWeatherData();
            });
        }
        
        if (aboutBtn && aboutModal) {
            aboutBtn.addEventListener('click', () => {
                aboutModal.classList.add('active');
            });
        }
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                if (aboutModal) aboutModal.classList.remove('active');
            });
        });
        
        if (aboutModal) {
            aboutModal.addEventListener('click', (e) => {
                if (e.target === aboutModal) {
                    aboutModal.classList.remove('active');
                }
            });
        }
        
        // Map layer buttons
        mapLayerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                mapLayerBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (btn.dataset.layer) {
                    updateWeatherMap(btn.dataset.layer);
                }
            });
        });
        
        if (cityInput && suggestionsDropdown) {
            cityInput.addEventListener('input', showSuggestions);
            cityInput.addEventListener('focus', showSuggestions);
        }
        
        document.addEventListener('click', (e) => {
            if (suggestionsDropdown && cityInput && 
                !cityInput.contains(e.target) && 
                !suggestionsDropdown.contains(e.target)) {
                suggestionsDropdown.classList.remove('active');
            }
        });
    }
    
    // Show city suggestions
    function showSuggestions() {
        if (!cityInput || !suggestionsDropdown) return;
        
        const query = cityInput.value.toLowerCase();
        if (!query) {
            suggestionsDropdown.innerHTML = '';
            suggestionsDropdown.classList.remove('active');
            return;
        }
        
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
            const geoResponse = await fetch(`${GEO_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
            
            if (!geoResponse.ok) {
                const errorData = await geoResponse.json();
                throw new Error(errorData.message || 'City not found');
            }
            
            const geoData = await geoResponse.json();
            
            if (geoData.length === 0) {
                throw new Error('City not found');
            }
            
            currentLocation = {
                lat: geoData[0].lat,
                lon: geoData[0].lon,
                city: geoData[0].name,
                country: geoData[0].country
            };
            
            localStorage.setItem('lastCity', currentLocation.city);
            addToRecentCities(currentLocation.city);
            
            if (cityInput) {
                cityInput.value = currentLocation.city;
            }
            
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
                    
                    const geoResponse = await fetch(
                        `${GEO_URL}/reverse?lat=${currentLocation.lat}&lon=${currentLocation.lon}&limit=1&appid=${API_KEY}`
                    );
                    
                    if (geoResponse.ok) {
                        const geoData = await geoResponse.json();
                        if (geoData.length > 0) {
                            currentLocation.city = geoData[0].name;
                            currentLocation.country = geoData[0].country;
                            
                            if (cityInput) {
                                cityInput.value = currentLocation.city;
                            }
                            
                            addToRecentCities(currentLocation.city);
                            localStorage.setItem('lastCity', currentLocation.city);
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
                let errorMessage = 'Unable to retrieve your location. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'Please check your location settings.';
                }
                alert(errorMessage);
                console.error('Geolocation error:', error);
            }
        );
    }
    
    // Load all weather data
    async function loadWeatherData() {
        if (!currentLocation.lat || !currentLocation.lon) {
            await searchWeather(currentLocation.city);
            return;
        }
        
        showLoading();
        
        try {
            const currentResponse = await fetch(
                `${BASE_URL}/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}&units=${units}&appid=${API_KEY}`
            );
            
            if (!currentResponse.ok) {
                throw new Error('Failed to fetch current weather data');
            }
            
            const currentData = await currentResponse.json();
            
            const forecastResponse = await fetch(
                `${BASE_URL}/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}&units=${units}&appid=${API_KEY}`
            );
            
            if (!forecastResponse.ok) {
                throw new Error('Failed to fetch forecast data');
            }
            
            const forecastData = await forecastResponse.json();
            
            const airQualityResponse = await fetch(
                `${BASE_URL}/air_pollution?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${API_KEY}`
            );
            
            let airQualityData = null;
            if (airQualityResponse.ok) {
                airQualityData = await airQualityResponse.json();
            }
            
            weatherData = {
                current: currentData,
                forecast: forecastData,
                airQuality: airQualityData
            };
            
            updateCurrentWeather();
            updateHourlyForecast();
            updateDailyForecast();
            updateAirQuality();
            updateWeatherAlerts();
            initMap(); // Initialize or update map
            updateLastUpdate();
            
        } catch (error) {
            console.error('Error loading weather data:', error);
            alert('Error loading weather data. Please check your API key and try again.');
        } finally {
            hideLoading();
        }
    }
    
    // Update current weather display
    function updateCurrentWeather() {
        if (!weatherData?.current) return;
        
        const data = weatherData.current;
        
        if (currentCity) {
            currentCity.textContent = `${data.name}, ${data.sys.country}`;
        }
        
        if (currentTemp) {
            const temp = Math.round(data.main.temp);
            currentTemp.textContent = temp;
        }
        
        if (minTemp && maxTemp) {
            const tempMin = Math.round(data.main.temp_min);
            const tempMax = Math.round(data.main.temp_max);
            minTemp.textContent = `${tempMin}°`;
            maxTemp.textContent = `${tempMax}°`;
        }
        
        if (feelsLike) {
            const feelsLikeTemp = Math.round(data.main.feels_like);
            feelsLike.textContent = `${feelsLikeTemp}°`;
        }
        
        if (currentCondition) {
            const condition = data.weather[0].description;
            currentCondition.textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
        }
        
        if (currentIcon) {
            const iconCode = data.weather[0].icon;
            currentIcon.innerHTML = `<i class="${weatherIcons[iconCode] || 'fas fa-cloud'}"></i>`;
        }
        
        if (windSpeed) {
            windSpeed.textContent = `${data.wind.speed} ${unitConfig[units].speed}`;
        }
        if (humidity) {
            humidity.textContent = `${data.main.humidity}%`;
        }
        if (pressure) {
            pressure.textContent = `${data.main.pressure} ${unitConfig[units].pressure}`;
        }
        
        if (visibility) {
            const visibilityValue = units === 'metric' 
                ? (data.visibility / 1000).toFixed(1)
                : (data.visibility / 1609).toFixed(1);
            visibility.textContent = `${visibilityValue} ${unitConfig[units].distance}`;
        }
        
        if (clouds) {
            clouds.textContent = `${data.clouds.all}%`;
        }
        
        if (sunrise && sunset && data.sys) {
            const sunriseTime = formatTime(data.sys.sunrise * 1000, data.timezone);
            const sunsetTime = formatTime(data.sys.sunset * 1000, data.timezone);
            
            sunrise.textContent = sunriseTime;
            sunset.textContent = sunsetTime;
        }
        
        if (dayLength && data.sys) {
            const dayLengthMs = data.sys.sunset * 1000 - data.sys.sunrise * 1000;
            const dayLengthHours = Math.floor(dayLengthMs / (1000 * 60 * 60));
            const dayLengthMinutes = Math.floor((dayLengthMs % (1000 * 60 * 60)) / (1000 * 60));
            dayLength.textContent = `${dayLengthHours}h ${dayLengthMinutes}m`;
        }
        
        if (uvi) {
            uvi.textContent = '--';
        }
    }
    
    // Update hourly forecast
    function updateHourlyForecast() {
        if (!weatherData?.forecast || !hourlyForecast) return;
        
        const forecastList = weatherData.forecast.list;
        
        hourlyForecast.innerHTML = '';
        
        const hourlyData = forecastList.slice(0, 8);
        
        hourlyData.forEach((item, index) => {
            const forecastTime = new Date(item.dt * 1000);
            const isCurrent = index === 0;
            
            const hourItem = document.createElement('div');
            hourItem.className = `hour-item ${isCurrent ? 'current' : ''}`;
            
            const timeStr = isCurrent ? 'Now' : formatTime(forecastTime.getTime(), weatherData.forecast.city.timezone, 'short');
            const temp = Math.round(item.main.temp);
            const iconCode = item.weather[0].icon;
            const iconClass = weatherIcons[iconCode] || 'fas fa-cloud';
            const condition = item.weather[0].description;
            
            hourItem.innerHTML = `
                <span class="hour-time">${timeStr}</span>
                <div class="hour-icon"><i class="${iconClass}"></i></div>
                <span class="hour-temp">${temp}°</span>
                <span class="hour-condition">${condition}</span>
            `;
            
            hourlyForecast.appendChild(hourItem);
        });
        
        if (hourlyRange && hourlyData.length > 0) {
            const startTime = new Date(hourlyData[0].dt * 1000);
            const endTime = new Date(hourlyData[hourlyData.length - 1].dt * 1000);
            hourlyRange.textContent = `${formatTime(startTime.getTime(), weatherData.forecast.city.timezone, 'short')} - ${formatTime(endTime.getTime(), weatherData.forecast.city.timezone, 'short')}`;
        }
    }
    
    // Update daily forecast
    function updateDailyForecast() {
        if (!weatherData?.forecast || !dailyForecast) return;
        
        const forecastList = weatherData.forecast.list;
        const dailyForecastMap = new Map();
        
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
        
        const dailyData = Array.from(dailyForecastMap.values())
            .slice(0, 5);
        
        dailyForecast.innerHTML = '';
        
        dailyData.forEach(day => {
            const minTemp = Math.round(Math.min(...day.temps));
            const maxTemp = Math.round(Math.max(...day.temps));
            
            const mostCommonCondition = getMostCommon(day.conditions);
            const mostCommonIcon = getMostCommon(day.icons);
            
            const dayItem = document.createElement('div');
            dayItem.className = 'day-item';
            
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
    
    function updateAirQuality() {
        if (!weatherData?.airQuality) {
            if (aqiValue) aqiValue.textContent = 'N/A';
            if (aqiLevel) {
                aqiLevel.textContent = 'No Data';
                aqiLevel.style.backgroundColor = '#7f8c8d';
            }
            if (aqiDescription) aqiDescription.textContent = 'Air quality data unavailable';
            return;
        }
        
        const aqData = weatherData.airQuality.list[0];
        const aqi = aqData.main.aqi;
        
        const aqiLevels = {
            1: { 
                text: 'Good', 
                color: '#00e400',
                description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
                range: '0-50',
                advice: 'Great day to be active outside.'
            },
            2: { 
                text: 'Fair', 
                color: '#ffff00',
                description: 'Air quality is acceptable. However, there may be a risk for some people.',
                range: '51-100',
                advice: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.'
            },
            3: { 
                text: 'Moderate', 
                color: '#ff7e00',
                description: 'Members of sensitive groups may experience health effects.',
                range: '101-150',
                advice: 'People with respiratory or heart disease, the elderly and children should limit prolonged exertion.'
            },
            4: { 
                text: 'Poor', 
                color: '#ff0000',
                description: 'Everyone may begin to experience health effects.',
                range: '151-200',
                advice: 'Active children and adults, and people with respiratory disease should avoid prolonged outdoor exertion.'
            },
            5: { 
                text: 'Very Poor', 
                color: '#8f3f97',
                description: 'Health warnings of emergency conditions. The entire population is affected.',
                range: '201-300',
                advice: 'Everyone should avoid all outdoor exertion.'
            }
        };
        
        const level = aqiLevels[aqi] || aqiLevels[3];
        
        // Update AQI value and level
        if (aqiValue) {
            aqiValue.textContent = aqi;
            aqiValue.title = `AQI Range: ${level.range}`;
        }
        
        if (aqiLevel) {
            aqiLevel.textContent = level.text;
            aqiLevel.style.backgroundColor = level.color;
            aqiLevel.title = level.description;
        }
        
        if (aqiDescription) {
            aqiDescription.textContent = level.advice;
        }
        
        const components = aqData.components;
        
        // WHO Air Quality Guidelines (2021)
        const pollutantStandards = {
            pm2_5: { good: 10, moderate: 25, poor: 50 },
            pm10: { good: 20, moderate: 50, poor: 100 },
            o3: { good: 100, moderate: 160, poor: 200 },
            no2: { good: 40, moderate: 200, poor: 400 },
            so2: { good: 20, moderate: 80, poor: 250 },
            co: { good: 4000, moderate: 10000, poor: 30000 }
        };
        
        function getPollutantColor(value, standard) {
            if (value <= standard.good) return '#00e400';
            if (value <= standard.moderate) return '#ffff00';
            if (value <= standard.poor) return '#ff7e00';
            return '#ff0000';
        }
        
        if (pm25) {
            const value = components.pm2_5;
            pm25.innerHTML = `${value.toFixed(1)} <small>μg/m³</small>`;
            pm25.style.color = getPollutantColor(value, pollutantStandards.pm2_5);
        }
        if (pm10) {
            const value = components.pm10;
            pm10.innerHTML = `${value.toFixed(1)} <small>μg/m³</small>`;
            pm10.style.color = getPollutantColor(value, pollutantStandards.pm10);
        }
        if (o3) {
            const value = components.o3;
            o3.innerHTML = `${value.toFixed(1)} <small>μg/m³</small>`;
            o3.style.color = getPollutantColor(value, pollutantStandards.o3);
        }
        if (no2) {
            const value = components.no2;
            no2.innerHTML = `${value.toFixed(1)} <small>μg/m³</small>`;
            no2.style.color = getPollutantColor(value, pollutantStandards.no2);
        }
        if (so2) {
            const value = components.so2;
            so2.innerHTML = `${value.toFixed(1)} <small>μg/m³</small>`;
            so2.style.color = getPollutantColor(value, pollutantStandards.so2);
        }
        if (co) {
            const value = components.co;
            co.innerHTML = `${value.toFixed(1)} <small>μg/m³</small>`;
            co.style.color = getPollutantColor(value, pollutantStandards.co);
        }
    }
    
    // Initialize Leaflet map
    function initMap() {
        if (!weatherMap) return;
        
        weatherMap.innerHTML = '';
        
        if (typeof L === 'undefined') {
            loadLeafletScripts();
            return;
        }
        
        // Initialize map if not exists
        if (!map) {
            map = L.map('weatherMap').setView([currentLocation.lat, currentLocation.lon], 10);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            L.marker([currentLocation.lat, currentLocation.lon])
                .addTo(map)
                .bindPopup(`<b>${currentLocation.city}</b><br>Current Weather`)
                .openPopup();
        } else {
            // Update map view
            map.setView([currentLocation.lat, currentLocation.lon], 10);
            
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker || layer instanceof L.TileLayer && layer !== map._layers[Object.keys(map._layers)[0]]) {
                    map.removeLayer(layer);
                }
            });
            
            L.marker([currentLocation.lat, currentLocation.lon])
                .addTo(map)
                .bindPopup(`<b>${currentLocation.city}</b><br>Current Weather`)
                .openPopup();
        }
        
        const activeLayer = document.querySelector('.map-layer-btn.active')?.dataset.layer || 'temp';
        addWeatherOverlay(activeLayer);
    }
    
    // Add weather overlay to map
    function addWeatherOverlay(layer) {
        if (!map || !API_KEY) return;
        
        // Remove existing weather overlay
        if (mapLayer) {
            map.removeLayer(mapLayer);
        }
        
        // OpenWeatherMap tile layers
        const weatherLayers = {
            temp: 'temp_new',
            precipitation: 'precipitation_new',
            clouds: 'clouds_new',
            wind: 'wind_new'
        };
        
        const layerName = weatherLayers[layer];
        if (!layerName) return;
        
        // Add OpenWeatherMap tile layer
        mapLayer = L.tileLayer(`https://tile.openweathermap.org/map/${layerName}/{z}/{x}/{y}.png?appid=${API_KEY}`, {
            attribution: '&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>',
            opacity: 0.6
        }).addTo(map);
    }
    
    // Update weather map with selected layer
    function updateWeatherMap(layer) {
        if (!map) {
            initMap();
        } else {
            addWeatherOverlay(layer);
        }
    }
    
    // Load Leaflet scripts dynamically
    function loadLeafletScripts() {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
        
        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => {
            setTimeout(() => {
                initMap();
            }, 100);
        };
        document.body.appendChild(script);
    }
    
    // Update weather alerts
    function updateWeatherAlerts() {
        if (!alertsContainer) return;
        
        if (weatherData?.current?.alerts && weatherData.current.alerts.length > 0) {
            const alerts = weatherData.current.alerts;
            alertsContainer.innerHTML = alerts.map(alert => `
                <div class="alert-item">
                    <div class="alert-title">
                        <i class="fas fa-exclamation-circle"></i>
                        ${alert.event}
                    </div>
                    <div class="alert-description">${alert.description}</div>
                    <div class="alert-time">
                        <i class="far fa-clock"></i> 
                        Until ${new Date(alert.end * 1000).toLocaleString()}
                    </div>
                </div>
            `).join('');
        } else {
            alertsContainer.innerHTML = `
                <div class="no-alerts">
                    <i class="fas fa-check-circle"></i>
                    <p>No active weather alerts for ${currentLocation.city}</p>
                </div>
            `;
        }
    }
    
    // Update date and time
    function updateDateTime() {
        if (!currentDateTime) return;
        
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        currentDateTime.textContent = now.toLocaleDateString('en-US', options);
    }
    
    // Update last update time
    function updateLastUpdate() {
        if (!lastUpdate) return;
        
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
        
        if (weatherData) {
            loadWeatherData();
        }
    }
    
    // Update units display
    function updateUnitsDisplay() {
        const tempUnit = unitConfig[units].temp;
        document.querySelectorAll('.temp-unit').forEach(el => {
            if (el) el.textContent = tempUnit;
        });
    }
    
    // Show loading modal
    function showLoading() {
        if (loadingModal) {
            loadingModal.classList.add('active');
        }
    }
    
    // Hide loading modal
    function hideLoading() {
        if (loadingModal) {
            loadingModal.classList.remove('active');
        }
    }
    
    // Format time
    function formatTime(timestamp, timezone, format = 'short') {
        const date = new Date(timestamp);
        
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
    
    // Format date
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
    function getMostCommon(arr) {
        if (!arr || arr.length === 0) return '';
        
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