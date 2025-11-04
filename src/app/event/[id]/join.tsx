import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEventById, joinEvent, checkEventMembership } from '@/services/events';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Join() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['events', id],
    queryFn: () => getEventById(id!),
  });

  const { data: isMember, isLoading: membershipLoading } = useQuery({
    queryKey: ['membership', id, user?.id],
    queryFn: () => checkEventMembership(id!, user?.id!),
    enabled: !!user?.id && !!id,
  });

  const joinEventMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return joinEvent(id!, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['events', id]});
      queryClient.invalidateQueries({queryKey: ['events', user?.id]}); // Refresh user's events list
      queryClient.invalidateQueries({queryKey: ['membership', id, user?.id]});
      
      // Show success message for a few seconds without buttons
      Alert.alert("Success! 🎉", "You've successfully joined the event!");
      
      // Navigate to event page after short delay
      setTimeout(() => {
        router.replace(`/event/${id}`);
      }, 1500);
    },
    onError: (error) => {
      console.error('Error joining event:', error);
      Alert.alert("Error", "Failed to join the event. Please try again.");
    }
  });

  const handleJoinEvent = () => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to join an event.");
      return;
    }
    joinEventMutation.mutate();
  };

  if (isLoading || membershipLoading) {
    return (
      <LinearGradient
        colors={['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={48} color="white" />
          <Text style={styles.loadingText}>Loading event...</Text>
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

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        {/* Black header area */}
      </SafeAreaView>
      <LinearGradient
        colors={['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="people-circle" size={80} color="white" />
        </View>
        
        <View style={styles.textContainer}>
          {isMember ? (
            <>
              {event?.owner_id === user?.id ? (
                <>
                  <Text style={styles.alreadyMemberText}>You are the owner of</Text>
                  <Text style={styles.eventName}>{event?.name}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.alreadyMemberText}>You're already a member of</Text>
                  <Text style={styles.eventName}>{event?.name}</Text>
                </>
              )}
            </>
          ) : (
            <>
              <Text style={styles.inviteText}>You are invited to join</Text>
              <Text style={styles.eventName}>{event?.name}</Text>
            </>
          )}
        </View>
        
        <Text style={styles.subtitle}>
          {isMember 
            ? (event?.owner_id === user?.id 
                ? "You created this event and can manage all photos and members"
                : "You can view and share photos in this event"
              )
            : "Scan the QR code or use this link to join this photo sharing event"
          }
        </Text>
        
        {isMember ? (
          <View style={styles.buttonContainer}>
            {event?.owner_id === user?.id && (
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={() => {
                  router.push(`/event/${id}/share`);
                }}
              >
                <View style={styles.shareButtonContent}>
                  <Ionicons name="qr-code" size={24} color="#06b6d4" />
                  <Text style={styles.shareButtonText}>Share QR Code</Text>
                </View>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => {
                // Navigate to event details page
                router.replace(`/event/${id}`);
              }}
            >
              <View style={styles.alreadyMemberButton}>
                <Ionicons 
                  name={event?.owner_id === user?.id ? "star" : "checkmark-circle"} 
                  size={24} 
                  color="#FFD700" 
                />
                <Text style={styles.alreadyMemberButtonText}>
                  {event?.owner_id === user?.id ? "Manage Event" : "View Event"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.joinButton,
              joinEventMutation.isPending && styles.joinButtonDisabled
            ]} 
            onPress={handleJoinEvent}
            disabled={joinEventMutation.isPending}
          >
            <View style={[
              styles.joinButtonGlass,
              joinEventMutation.isPending && styles.joinButtonGlassDisabled
            ]}>
              {joinEventMutation.isPending ? (
                <>
                  <Ionicons name="hourglass" size={24} color="rgba(255,165,0,0.5)" />
                  <Text style={styles.joinButtonTextDisabled}>Joining...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="flash" size={24} color="#FFA500" />
                  <Text style={styles.joinButtonText}>Join Event</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  safeAreaTop: {
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 32,
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
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  inviteText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alreadyMemberText: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  joinButton: {
    marginTop: 16,
    borderRadius: 0,
    overflow: 'hidden',
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  joinButtonGlassDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,215,0,0.15)',
  },
  joinButtonText: {
    color: '#FFA500',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  joinButtonTextDisabled: {
    color: 'rgba(255,165,0,0.5)',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  alreadyMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  alreadyMemberButtonText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  shareButton: {
    marginBottom: 8,
    borderRadius: 0,
    overflow: 'hidden',
  },
  shareButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  shareButtonText: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});