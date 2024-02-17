const userTab = document.querySelector(".user-tab")
const searchTab = document.querySelector(".search-tab")
const searchContainer = document.querySelector(".search-container");
const weatherInfo = document.querySelector('.weatherInfo');
const grantLocation = document.querySelector(".grantlocation-container");
const grantBtn = document.querySelector(".grant-location-btn");
const loadingContainer = document.querySelector(".loading-container");
const searchInput = document.querySelector("[data-searchInput]");
const searchForm = document.querySelector(".search-container");
const errorContainer = document.querySelector(".api-error-container");

//function declaration
let currentTab = userTab;
const API_KEY = "c7d1b35645fb9c539940bc0bdc505c5e"
currentTab.classList.add('current-tab');
getFromSessionStorage();

function switchTab(clickedTab) {

    errorContainer.classList.remove("active");

    if (clickedTab != currentTab) {
        //updating currentTab
        currentTab.classList.remove('current-tab');
        currentTab = clickedTab;
        currentTab.classList.add('current-tab');

        //content showing;
        if (!searchContainer.classList.contains('active')) {

            grantLocation.classList.remove('active');
            weatherInfo.classList.remove('active');
            searchContainer.classList.add('active');

        }
        else {
            searchContainer.classList.remove('active');
            weatherInfo.classList.remove('active');
            getFromSessionStorage();
        }

    }

}

function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantLocation.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Your browser doesn't support geolocation API");
    }
}

function showPosition(position) {

    const coordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(coordinates));
    fetchUserWeatherInfo(coordinates);
}

async function fetchUserWeatherInfo(coordinates) {

    const { lat, lon } = coordinates;
    grantLocation.classList.remove('active');
    loadingContainer.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        loadingContainer.classList.remove("active");
        weatherInfo.classList.add('active');
        // console.log(data);
        renderweatherInfo(data);
    }
    catch (err) {
        console.log("Error", err)
        errorContainer.classList.add("active");

    }

}
function renderweatherInfo(data) {

    const cityName = document.querySelector(".cityname");
    const countryIcon = document.querySelector("[flag]");
    const desc = document.querySelector(".weather-name");
    const weatherIcon = document.querySelector("[weatherImage]");
    const temp = document.querySelector(".temp");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = data?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.innerText = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText = `${data?.main?.temp} °C`;
    windspeed.innerText = `${data?.wind?.speed} m/s`;
    humidity.innerText = `${data?.main?.humidity}%`;
    cloudiness.innerText = `${data?.clouds?.all}%`;

}

async function fetchSearchWeatherInfo(city) {
    loadingContainer.classList.add("active");
    weatherInfo.classList.remove("active");
    grantLocation.classList.remove("active");
    errorContainer.classList.remove("active");
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        // console.log("DATA IS :", data);
        if (!data.sys) {
            throw data;
        }
        loadingContainer.classList.remove("active");
        weatherInfo.classList.add("active");
        renderweatherInfo(data);
    }
    catch (err) {
        // console.log(err);
        loadingContainer.classList.remove("active");
        errorContainer.classList.add("active");
        const errorMegs = document.querySelector("[data-apiErrorText]");
        errorMegs.innerText = `${err?.message}`;

    }

}




// adding eventlistener

userTab.addEventListener('click', () => {
    switchTab(userTab);
});
searchTab.addEventListener('click', () => {
    switchTab(searchTab);
});

grantBtn.addEventListener('click', () => {
    getLocation();
});

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    // console.log("CITY NAME IS : ", cityName);

    if (cityName === "")
        return;
    else
        fetchSearchWeatherInfo(cityName);
})


