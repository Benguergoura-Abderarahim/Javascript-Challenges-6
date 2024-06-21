// Function to convert seconds to hours, minutes, and seconds
function secondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = (seconds % 60).toFixed(2);
  return `${hours} h, ${minutes} m, ${remainingSeconds} s`;
}

// Use the DOM to associate with a main event listener method
document.addEventListener("DOMContentLoaded", function () {
  const weatherButton = document.getElementById("get-weather-btn"); // declare the button to generate the weather -when clicked-
  let cityList;
  let option; // Declare option variable outside the fetch block

  // use the fetch native js method (could use axios, but requires react which is not yet seen in course at this moment)
  fetch(
    "https://raw.githubusercontent.com/lmfmaier/cities-json/master/cities500.json"
  )
    .then((response) => response.json()) // the response requested will be formatted as json
    .then((data) => {
      const filteredCities = data.filter((city) => city.pop > 1000000); //I filtered by population(>1m). Otherwise, the browser crashes -handling too many data-
      cityList = document.getElementById("city-list"); // create the list of cities to choose for weather

      // for each city (filtered by pop already), we extract its longitude & latitude to use them with the weather api later
      filteredCities.forEach((city) => {
        option = document.createElement("option");
        const latitude = parseFloat(city.lat).toFixed(4); // only 4 decimal numbers to display (toFixed(4))
        const longitude = parseFloat(city.lon).toFixed(4);
        option.value = `${latitude}, ${longitude}`;
        option.textContent = city.name;
        cityList.appendChild(option); // we append the infos of a city to our city list
      });

      // now we'll use the other api used here for the weather:
      weatherButton.addEventListener("click", () => {
        const selectedCity = cityList.value.split(","); // we split the previous values of cities (longitude & latitude to use them separately)
        const latitude = parseFloat(selectedCity[0]).toFixed(4);
        const longitude = parseFloat(selectedCity[1]).toFixed(4);

        // the fetch to call the weather api
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,is_day,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration`
        )
          .then((response) => response.json())
          .then((weatherData) => {
            const currentWeather = weatherData.current;
            const isDayText = currentWeather.is_day // check if it's day or night on selected city
              ? 'Yes <i class="fa-regular fa-sun"></i>'
              : 'No <i class="fa-regular fa-moon"></i>';
            let cloudCoverLabel; //condition to display icons using cloud cover parameter:0 => 35 (sky clear),35 => 65 (partially cloudy), >65 : cloudy,
            if (currentWeather.cloud_cover >= 65) {
              cloudCoverLabel = '<i class="fa-solid fa-cloud"></i>';
            } else if (currentWeather.cloud_cover >= 35) {
              cloudCoverLabel = '<i class="fa-solid fa-cloud-sun"></i>';
            } else {
              cloudCoverLabel = '<i class="fa-solid fa-sun"></i>';
            }

            // using the api parameters for the current weather
            const currentWeatherData = `<b>Temperature <i class="fa-solid fa-temperature-full"></i>: </b> ${currentWeather.temperature_2m}°C<br>
              <b>Apparent Temperature <i class="fa-solid fa-temperature-high"></i>: </b> ${currentWeather.apparent_temperature}°C<br>
              <b>Is Day: </b> ${isDayText}<br>
              <b>Cloud Cover ${cloudCoverLabel} : </b> ${currentWeather.cloud_cover} <br>
              <b>Wind Speed <i class="fa-solid fa-wind"></i> : </b> ${currentWeather.wind_speed_10m} m/s<br>
              <b>Wind Direction <i class="fa-solid fa-location-arrow"></i> : </b> ${currentWeather.wind_direction_10m}°<br>`;
            document.getElementById("current-weather").innerHTML =
              currentWeatherData;

            // now the current weather for each day of the week (starting actual day of selected city)
            const daily = weatherData.daily;
            const forecastContainer = document.getElementById("forecast");
            forecastContainer.innerHTML = ""; // Clear forecast container
            daily.time.forEach((timestamp, index) => {
              const forecastItem = document.createElement("div");
              forecastItem.classList.add("forecast-item");
              forecastItem.innerHTML = `<u><b>Date:</b> ${timestamp}</u><br>
          <b>Max Temperature <i class="fa-solid fa-temperature-full"></i> :</b> ${
            daily.temperature_2m_max[index]
          }°C<br>
          <b>Min Temperature <i class="fa-solid fa-temperature-empty"></i> :</b> ${
            daily.temperature_2m_min[index]
          }°C<br>
          <b>Apparent Max Temperature <i class="fa-solid fa-temperature-high"></i> :</b> ${
            daily.apparent_temperature_max[index]
          }°C<br>
          <b>Apparent Min Temperature <i class="fa-solid fa-temperature-low"></i> :</b> ${
            daily.apparent_temperature_min[index]
          }°C<br>
          <b>Sunrise <span class="mdi mdi-weather-sunset-up"></span> :</b> ${
            daily.sunrise[index]
          }<br>
          <b>Sunset <span class="mdi mdi-weather-sunset-down"></span> :</b> ${
            daily.sunset[index]
          }<br>
          <b>Daylight Duration <i class="fa-solid fa-hourglass-start"></i> :</b> ${secondsToTime(
            daily.daylight_duration[index]
          )} <br>
          <b>Sunshine Duration <i class="fa-solid fa-hourglass-end"></i> :</b> ${secondsToTime(
            daily.sunshine_duration[index]
          )} `;
              forecastContainer.appendChild(forecastItem); // append the forecast item into its container -each item represent the weather of the week day
            });
          })
          .catch((error) => {
            console.error("Error fetching weather data:", error);
          });
      });
    })
    .catch((error) => {
      console.error("Error fetching city data:", error);
    });
});
