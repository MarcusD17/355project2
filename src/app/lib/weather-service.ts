import axios from 'axios';

const BASE_URL = 'https://api.openweathermap.org/data/2.5/';
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

const getFromCache = (city: string) => {
    const cachedData = localStorage.getItem(city);
    if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
            return data; // Return cached data if it's still valid
        }
    }
    return null;
};

const setToCache = (city: string, data: unknown) => {
    const cacheData = {
        data,
        timestamp: Date.now(), // Store the current timestamp
    };
    localStorage.setItem(city, JSON.stringify(cacheData));
};

// The main function
export const getWeather = async (city: string) => {
    try {
        const cachedData = getFromCache(city);
        if (cachedData) {
            console.log('Using cached data for', city);
            return cachedData;
        }

        // Fetch data from API if not found in cache or cache is expired
        const response = await axios.get(`${BASE_URL}weather`, {
            params: {
                q: city,
                appid: API_KEY,
                units: 'metric',
            },
        });

        // Cache the new data
        setToCache(city, response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};