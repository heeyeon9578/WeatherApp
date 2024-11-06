import { Image, StyleSheet, Platform, View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Fontisto } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_KEY = '1403d5fcf20669d858eb5530c1f9199c';

type WeatherCondition = "Clouds" | "Clear" | "Rain" | "Atmosphere" | "Snow" | "Drizzle" | "Thunderstorm";

const icons: Record<WeatherCondition, keyof typeof Fontisto.glyphMap> = {
  Clear: "day-sunny",
  Clouds: "cloudy",
  Rain: "rain",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Drizzle: "day-rain",
  Thunderstorm: "lightning",
};

function isWeatherCondition(condition: string): condition is WeatherCondition {
  return condition in icons;
}

interface WeatherData {
  dt_txt: string;
  main: {
    temp: number;
  };
  weather: { main: string, description: string }[];
}

export default function HomeScreen() {
  const [city, setCity] = useState<string | null>("Loading");
  const [days, setDays] = useState<WeatherData[]>([]);
  const [ok, setOk] = useState(true);

  const ask = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });

    setCity(location[0].city);
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
    const { list }: { list: WeatherData[] } = await response.json();
    const filteredList = list.filter(({ dt_txt }) => dt_txt.endsWith("00:00:00"));
    setDays(filteredList);
  };

  useEffect(() => {
    ask();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style='light' />
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>

      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator color="white" size='large' style={{ marginTop: 10 }} />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "space-between" }}>
                <Text style={styles.temp}>{Math.round(day.main.temp - 273.15)}°C</Text>
                <Fontisto
                  name={isWeatherCondition(day.weather[0].main) ? icons[day.weather[0].main] : "cloudy"}
                  size={60}
                  color="white"
                />
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: 'pink',
  },
  city: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    color: 'white',
    fontSize: 68,
    fontWeight: "500",
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
  },
  temp: {
    color: 'white',
    marginTop: 50,
    fontSize: 100,
  },
  description: {
    color: 'white',
    marginTop: -30,
    fontSize: 60,
  },
  tinyText: {
    color: 'white',
    fontSize: 20,
  }
});
