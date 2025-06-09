require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/weather', async (req, res) => {
  const city = req.body.city;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);

    const data = response.data;
    const temperature = data.main.temp;
    const tempF = ((temperature * 9) / 5 + 32).toFixed(1);
    const windspeed = data.wind.speed;
    const description = data.weather[0].description;
    const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const name = data.name;
    const country = data.sys.country;

    res.render('result', {
      city: name,
      country,
      temperature,
      tempF,
      windspeed,
      icon,
      description
    });
  } catch (err) {
    console.error("API Error:", {
      message: err.message,
      responseData: err.response?.data,
      status: err.response?.status,
      url: err.config?.url
    });
    res.render('error', { message: "City not found or API error. Please try again." });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🌦️ WeatherNow running on http://localhost:3000');
});
