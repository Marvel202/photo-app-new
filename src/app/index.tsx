import React from 'react';
import { Text, StyleSheet, View, ActivityIndicator, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { getEvents, getUserEvents } from '../services/events';
import EventListItem from '../components/EventListItem';


export default function Home() {
  const { isAuthenticated, user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return getUserEvents(user.id);
    },
    enabled: !!user?.id
  });

  console.log(isAuthenticated, user);

  if (!isAuthenticated || !user) {
    return (
      <LinearGradient
        colors={['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.text}>Authenticating...</Text>
      </LinearGradient>
    );
  }

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.text}>Loading your events...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <Text style={styles.text}>Error: {error.message}</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#06b6d4', '#3b82f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.authInfo}>
        <Text style={styles.authText}>
          {isAuthenticated ? `Signed in: ${user?.id}` : 'Not authenticated'}
        </Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerText}>Events ({data?.length || 0})</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventListItem event={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyText}>No events to show</Text>
            <Text style={styles.emptySubtext}>Create an event or join others using a QR code!</Text>
          </View>
        }
        ListHeaderComponent={() => (
          <Link href="/event/create" asChild>
            <Pressable style={styles.createEventBanner}>
              <LinearGradient
                colors={['#FF8C00', '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createEventGradient}
              >
                <Text style={styles.createEventText}>+ Create Event</Text>
              </LinearGradient>
            </Pressable>
          </Link>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  authInfo: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  authText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  createEventBanner: {
    marginVertical: 6,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  createEventGradient: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createEventText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});
