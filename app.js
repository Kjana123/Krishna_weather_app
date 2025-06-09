const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const weatherCodes = {
  0: { icon: "☀️", desc: "Clear sky" },
  1: { icon: "🌤️", desc: "Mainly clear" },
  2: { icon: "⛅", desc: "Partly cloudy" },
  3: { icon: "☁️", desc: "Overcast" },
  45: { icon: "🌫️", desc: "Fog" },
  48: { icon: "🌫️", desc: "Depositing rime fog" },
  51: { icon: "🌦️", desc: "Light drizzle" },
  53: { icon: "🌦️", desc: "Moderate drizzle" },
  55: { icon: "🌧️", desc: "Dense drizzle" },
  61: { icon: "🌧️", desc: "Slight rain" },
  63: { icon: "🌧️", desc: "Moderate rain" },
  65: { icon: "🌧️", desc: "Heavy rain" },
  80: { icon: "🌦️", desc: "Rain showers" },
  95: { icon: "⛈️", desc: "Thunderstorm" },
  99: { icon: "🌩️", desc: "Thunderstorm with hail" },
};

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/weather', async (req, res) => {
  const city = req.body.city;
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoRes = await axios.get(geoUrl, {
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'RenderHostedApp/1.0'
  }
});
    const location = geoRes.data.results?.[0];

    if (!location) {
      console.warn(`City not found: ${city}`);
      return res.render('error', { message: "City not found. Please try again." });
    }

    const { latitude, longitude, name, country } = location;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
 const weatherRes = await axios.get(weatherUrl, {
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'RenderHostedApp/1.0' // or use any fake user agent
  }
});


    const current = weatherRes.data.current_weather;
    if (!current) {
      return res.render('error', { message: "Weather data unavailable. Try another city." });
    }

    const { temperature, weathercode, windspeed } = current;
    const weather = weatherCodes[weathercode] || { icon: "❓", desc: "Unknown" };
    const tempF = ((temperature * 9) / 5 + 32).toFixed(1);

    res.render('result', {
      city: name,
      country,
      temperature,
      tempF,
      windspeed,
      icon: weather.icon,
      description: weather.desc
    });
  } catch (err) {
    console.error("API Error:", {
      message: err.message,
      responseData: err.response?.data,
      status: err.response?.status,
      url: err.config?.url
    });
    res.render('error', { message: "Something went wrong. Please try again later." });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🌦️ WeatherNow running at http://localhost:3000');
});
