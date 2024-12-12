'use client'; // Ensure it's a client-side component

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getWeather } from '@/app/lib/weather-service';

// Define the types for weather data
interface WeatherMain {
    temp: number;
    humidity: number;
}

interface WeatherCondition {
    description: string;
}

interface CurrentWeather {
    name: string;
    main: WeatherMain;
    weather: WeatherCondition[];
    wind: {
        speed: number;
    };
}

const WeatherPage = () => {
    const [city, setCity] = useState<string>('London'); // Default city
    const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Memoize the fetchWeatherData function to prevent unnecessary re-creations
    const fetchWeatherData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const weatherData = await getWeather(city);
            setCurrentWeather(weatherData); // Now weatherData is typed as CurrentWeather
        } catch (err) {
            setError('Could not fetch weather data');
        } finally {
            setLoading(false);
        }
    }, [city]); // Only recreate fetchWeatherData when `city` changes

    // Memoize city input change handler to avoid re-creations on every render
    const handleCityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCity(e.target.value);
    }, []);

    // Fetch data when the city changes
    useEffect(() => {
        fetchWeatherData();
    }, [fetchWeatherData]); // Depend on memoized fetchWeatherData

    // Memoize the weather data display to prevent unnecessary re-renders
    const weatherDisplay = useMemo(() => {
        if (currentWeather) {
            return (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold">{currentWeather.name}</h3>
                    <p>Temperature: {currentWeather.main.temp}°C</p>
                    <p>Weather: {currentWeather.weather[0].description}</p>
                    <p>Humidity: {currentWeather.main.humidity}%</p>
                    <p>Wind Speed: {currentWeather.wind.speed} m/s</p>
                </div>
            );
        }
        return null;
    }, [currentWeather]); // Only re-render if currentWeather changes

    return (
        <div className="max-w-md mx-auto p-6 mt-20">
            <h2 className="text-2xl font-semibold text-center">Weather Information</h2>

            <div className="mt-5">
                <input
                    type="text"
                    value={city}
                    onChange={handleCityChange}
                    placeholder="Enter city name"
                    className="w-full p-3 border-2 border-blue-300 rounded-lg"
                />
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {weatherDisplay}
        </div>
    );
};

export default WeatherPage;
