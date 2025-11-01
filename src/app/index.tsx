import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import {Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useAuth } from '../providers/AuthProvider';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  console.log('isAuthenticated:', isAuthenticated, user);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's an existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Supabase session:', session);
        setSession(session);
        
        // If no session, sign in anonymously
        if (!session) {
          console.log('No session found, signing in anonymously...');
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error('Anonymous sign-in error:', error);
          } else {
            console.log('Anonymous sign-in success:', data.session);
            setSession(data.session);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, 'Session:', session?.user?.id);
        setSession(session);
      }
    );

    // Fetch events
    supabase.from('events').select('*').then(({ data, error }) => {
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        console.log('Fetched events:', JSON.stringify(data, null, 2));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <LinearGradient
        colors={['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <Text style={styles.text}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#06b6d4', '#3b82f6']} // from-cyan-500 to-blue-500
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="flex-1 justify-center items-center"
      style={styles.container}
    >
      <View style={styles.authInfo}>
        <Text style={styles.authText}>
          {session ? `Signed in as: ${session.user?.id}` : 'Not authenticated'}
        </Text>
      </View>

      <Text 
        className="text-2xl font-bold text-white mb-4"
        style={styles.text}
      >
        <Link href="/camera" className='text-white'>Open Camera</Link>
      </Text>
      
      <Text 
        className="text-2xl font-bold text-white"
        style={styles.text}
      >
        <Link href="/event" className='text-white'>Event Details</Link>
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
  authInfo: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
  },
  authText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
