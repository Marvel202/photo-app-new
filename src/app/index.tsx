import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import {Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <LinearGradient
      colors={['#06b6d4', '#3b82f6']} // from-cyan-500 to-blue-500
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="flex-1 justify-center items-center"
      style={styles.container}
    >
      <Text 
        className="text-2xl font-bold text-white"
        style={styles.text}
      >
        <Link href="/camera" className='text-white'>Open Camera</Link>
      </Text>

      <Ionicons name="add" size={30} color="white" />
   </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
