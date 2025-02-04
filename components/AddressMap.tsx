/* eslint-disable @typescript-eslint/no-require-imports */
import React, { useState, useEffect } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Portal } from 'react-native-paper';
import { Map } from 'leaflet';

const AddressMap = ({ 
  latitude,
  longitude, 
  setLatitude, 
  setLongitude 
} : {
  latitude: number, 
  longitude: number, 
  setLatitude: (latitude: number) => void,
  setLongitude: (longitude: number) => void
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentLatitude, setCurrentLatitude] = useState(latitude);
  const [currentLongitude, setCurrentLongitude] = useState(longitude);
  const [zoom, setZoom] = useState(16);
  const [map, setMap] = useState<Map | null>(null);
  const [modalMap, setModalMap] = useState<Map | null>(null);
  const screenHeight = Dimensions.get('window').height;

  const toggleMapSize = () => {
    setIsMaximized(!isMaximized);
  };

  const setMapAndListenMove = (thisMap: {target: Map}) => {
    setMap(thisMap.target);
    thisMap.target.on('move', () => {
      handleMapMove(thisMap.target, modalMap!);
    });
  };

  const setModalMapAndListenMove = (thisMapEvent: {target: Map}) => {
    setModalMap(thisMapEvent.target);
    thisMapEvent.target.on('move', () => {
      handleMapMove(thisMapEvent.target, map!);
    });
  };

  const handleMapMove = (thisMap: Map, otherMap: Map) => {
    const { lat, lng } = thisMap.getCenter();
    setZoom(thisMap.getZoom());
    setLatitude(lat);
    setLongitude(lng);
    setCurrentLatitude(lat);
    setCurrentLongitude(lng);
    if (otherMap) otherMap.setView(thisMap.getCenter(), thisMap.getZoom());
  };

  const handleRegionChangeComplete = (region: { latitude: number, longitude: number }) => {
    setCurrentLatitude(region.latitude);
    setCurrentLongitude(region.longitude);
    setLatitude(region.latitude);
    setLongitude(region.longitude);
  };

  if (Platform.OS === 'web') {
    const { MapContainer, TileLayer, Marker } = require('react-leaflet');
    const L = require('leaflet');
    require('leaflet/dist/leaflet.css'); 

    const customIcon = new L.Icon({
      iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
      iconSize: [38, 38],
      iconAnchor: [22, 42]
    });
    const polygonCoordinates = [
      [latitude - 0.01, longitude - 0.01],
      [latitude - 0.01, longitude + 0.01],
      [latitude + 0.01, longitude + 0.01],
      [latitude + 0.01, longitude - 0.01],
    ];

    return (
      <>
        <MapContainer
          center={[currentLatitude, currentLongitude]}
          zoom={zoom}
          style={{ height: screenHeight * 0.4, width: '100%' }}
          whenReady={setMapAndListenMove}
          scrollWheelZoom={false}
        >
          {/* <Polygon positions={polygonCoordinates} pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.3 }} /> */}

          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png"
          />
          <Marker position={[currentLatitude, currentLongitude]} icon={customIcon} />
          <Pressable style={styles.icon} onPress={toggleMapSize}>
            <Ionicons name={isMaximized ? 'contract' : 'expand'} size={24} color="black" />
          </Pressable>
        </MapContainer>
        <Portal>
          <Modal visible={isMaximized} onDismiss={toggleMapSize}>
            <MapContainer
              center={[currentLatitude, currentLongitude]}
              zoom={zoom}
              style={{ height: screenHeight, width: '100%' }}
              whenReady={setModalMapAndListenMove}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png"
              />
              <Marker position={[currentLatitude, currentLongitude]} icon={customIcon} />
              <Pressable style={styles.icon} onPress={toggleMapSize}>
                <Ionicons name="contract" size={24} color="black" />
              </Pressable>
            </MapContainer>
          </Modal>
        </Portal>
      </>
    );
  } else {
    const MapView = require('react-native-maps').default;
    const NativeMarker = require('react-native-maps').Marker;

    return (
      <>
        <MapView
          style={{ ...styles.map, height: isMaximized ? screenHeight : screenHeight * 0.4 }}
          initialRegion={{
            latitude: currentLatitude,
            longitude: currentLongitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          <NativeMarker coordinate={{ latitude: currentLatitude, longitude: currentLongitude }}>
            <Image source={{ uri: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png' }} style={{ height: 38, width: 38 }} />
          </NativeMarker>
          <TouchableOpacity style={styles.icon} onPress={toggleMapSize}>
            <Ionicons name={isMaximized ? 'contract' : 'expand'} size={24} color="black" />
          </TouchableOpacity>
        </MapView>
        <Portal>
          <Modal visible={isMaximized} onDismiss={toggleMapSize}>
            <MapView
              style={{ height: screenHeight, width: '100%' }}
              initialRegion={{
                latitude: currentLatitude,
                longitude: currentLongitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onRegionChangeComplete={handleRegionChangeComplete}
            >
              <NativeMarker coordinate={{ latitude: currentLatitude, longitude: currentLongitude }}>
                <Image source={{ uri: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png' }} style={{ height: 38, width: 38 }} />
              </NativeMarker>
              <TouchableOpacity style={styles.icon} onPress={toggleMapSize}>
                <Ionicons name="contract" size={24} color="black" />
              </TouchableOpacity>
            </MapView>
          </Modal>
        </Portal>
      </>
    );
  }
};

const styles = StyleSheet.create({
  icon: {
    backgroundColor: '#FDFDFD',
    borderRadius: 3,
    elevation: 5,
    padding: 4,
    position: 'absolute',
    right: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    top: 10,
    zIndex: 1000,
  },
  map: {
    width: '100%',
  },
});

export default AddressMap;