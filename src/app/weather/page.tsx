'use client'; // Mark this file as a client component for hooks

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Types for the weather and forecast data
interface WeatherData {
    main: {
        temp: number;
        humidity: number;
    };
    weather: { description: string }[];
    wind: { speed: number };
}

interface ForecastData {
    list: {
        dt: number;
        main: {
            temp: number;
        };
        weather: { description: string }[];
    }[];
}

const WeatherApp = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null); // For current weather
    const [forecastData, setForecastData] = useState<ForecastData | null>(null); // For 5-day forecast
    const [location, setLocation] = useState('London'); // Default location
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error handling
    const [search, setSearch] = useState(''); // For search input

    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY; // Replace with your OpenWeatherMap API key

    // Memoize the fetchWeatherData function to avoid unnecessary re-fetching
    const fetchWeatherData = useMemo(() => {
        return async () => {
            try {
                setLoading(true); // Start loading
                setError(null); // Reset error state before making the request

                // Fetch current weather data
                const currentWeatherResponse = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`
                );

                if (currentWeatherResponse.data.cod !== 200) {
                    throw new Error('Location not found');
                }

                setWeatherData(currentWeatherResponse.data);

                // Fetch 5-day forecast data
                const forecastResponse = await axios.get(
                    `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${apiKey}`
                );

                if (forecastResponse.data.cod !== '200') {
                    throw new Error('Location not found');
                }

                setForecastData(forecastResponse.data);
                setLoading(false); // Stop loading
            } catch (err: unknown) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(err.message || 'Failed to fetch data');
                setLoading(false); // Stop loading on error
            }
        };
    }, [location]); // The function is memoized and will only change when `location` changes.

    // Call the memoized fetch function whenever the location changes
    useEffect(() => {
        fetchWeatherData();
    }, [location, fetchWeatherData]); // Depend on `location` and the memoized fetch function

    // Handle search submit
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim() !== '') {
            setLocation(search);
            setSearch(''); // Clear the search input after submitting
        }
    };

    return (
        <div className="max-w-screen-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-40">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Weather in {location}</h1>
            <h2 className="font-bold text-center text-gray-800 mb-6" >From our state of the art global weather stations</h2>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Enter a location"
                    className="p-3 flex-1 border border-gray-300 text-gray-800 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none"
                >
                    Search
                </button>
            </form>

            {/* Error Message */}
            {error && (
                <div className="mb-4 text-center text-xl text-red-500">
                    {error}
                </div>
            )}

            {/* Loading Spinner */}
            {loading && <div className="text-center text-xl">Loading...</div>}

            {/* Current Weather */}
            {weatherData && !error && (
                <div className="mb-8 p-4 bg-blue-100 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-black mb-4">Current Weather:</h2>
                    <p className="text-lg text-gray-800">Temperature: <span className="font-semibold text-gray-800">{weatherData.main?.temp}°C</span></p>
                    <p className="text-lg text-gray-800">Weather: <span className="font-semibold text-gray-800">{weatherData.weather?.[0]?.description}</span></p>
                    <p className="text-lg text-gray-800">Humidity: <span className="font-semibold text-gray-800">{weatherData.main?.humidity}%</span></p>
                    <p className="text-lg text-gray-800">Wind Speed: <span className="font-semibold text-gray-800">{weatherData.wind?.speed} m/s</span></p>
                </div>
            )}

            {/* 5-Day Weather Forecast */}
            {forecastData && !error && (
                <div className="p-4 bg-green-100 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-gray-800">5-Day Forecast:</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forecastData.list?.slice(0, 5).map((forecast, index) => (
                            <div key={index} className="p-4 bg-white rounded-lg shadow-md text-gray-800">
                                <p className="font-semibold text-lg text-gray-800">{new Date(forecast.dt * 1000).toLocaleString()}</p>
                                <p className="text-lg text-gray-800">Temp: <span className="font-semibold text-gray-800">{forecast.main?.temp}°C</span></p>
                                <p className="text-lg text-gray-800">Weather: <span className="font-semibold text-gray-800">{forecast.weather?.[0]?.description}</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherApp;
