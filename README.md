# WeatherFlow - Real-Time Weather Dashboard
[Open](https://icybits-lab.github.io/WeatherFlow/)

A modern, responsive weather dashboard that provides comprehensive weather information using the OpenWeatherMap API.

## Features

### 🌤️ Current Weather
- **Real-time temperature** with feels-like temperature
- **Weather conditions** with appropriate icons
- **Wind speed and direction**
- **Humidity and pressure** readings
- **Sunrise and sunset** times with day length
- **Visibility and cloud cover** percentages

### 📊 Advanced Forecasts
- **24-hour hourly forecast** with 3-hour intervals
- **5-day daily forecast** with min/max temperatures
- **Interactive weather maps** (temperature, precipitation, clouds, wind layers)
- **Detailed air quality index** with pollutant levels

### 🎨 User Experience
- **Dark/Light theme** toggle
- **Metric/Imperial units** conversion
- **City search** with auto-suggestions
- **Recent searches** quick access
- **Geolocation** support
- **Responsive design** for all devices
- **Smooth animations** and transitions

### 🔧 Technical Features
- **OpenWeatherMap API integration**
- **LocalStorage** for preferences and recent searches
- **Error handling** and user feedback
- **Loading states** and progress indicators
- **Automatic data refresh**

## Project Structure
```
/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Getting Started

### Prerequisites
1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation
1. Clone or download the project files
2. Open `index.html` in your browser
3. Replace `YOUR_OPENWEATHERMAP_API_KEY` in `script.js` with your actual API key

### API Key Setup
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key
5. Paste it in `script.js`:
```javascript
const API_KEY = 'your_actual_api_key_here';
```

### Warning
You may need OpenWeatherMap Premium for it to work properly.
