import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getEventById } from '@/services/events';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

export default function Share() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['events', id],
    queryFn: () => getEventById(id!),
  });

  // Access control is now handled by proper navigation flow
  // The join page will only navigate here for owners

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
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
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FFA500" />
          <Text style={styles.errorText}>Error loading event</Text>
        </View>
      </LinearGradient>
    );
  }

  // Only show content if user is the event owner
  if (!event || !user || event.owner_id !== user.id) {
    return (
      <LinearGradient
        colors={['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={48} color="#FFA500" />
          <Text style={styles.errorText}>Access Denied</Text>
          <Text style={styles.errorSubtext}>Only the event owner can share QR codes</Text>
        </View>
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
     <View style={styles.content}>
       <View style={styles.ownerBadge}>
         <Ionicons name="star" size={20} color="#FFD700" />
         <Text style={styles.ownerText}>Event Owner</Text>
       </View>
       <Text style={styles.title}>Share "{event?.name}" with friends</Text>
       <View style={styles.qrContainer}>
         <QRCode
           value={`exp://192.168.1.12:8081/--/event/${id}/join`}
           size={200}
           backgroundColor="white"
           color="black"
         />
       </View>

       <Text style={styles.instructions}>
         Share this QR code with friends so they can join your event
       </Text>
     </View>
   </LinearGradient>
 );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 24,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  instructions: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    gap: 6,
  },
  ownerText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
});
   