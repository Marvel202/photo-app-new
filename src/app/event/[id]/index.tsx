import { View, Text, StyleSheet, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { AdvancedImage } from 'cloudinary-react-native';
import { cloudinary } from '../../../lib/cloudinary';
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { artisticFilter } from '@cloudinary/url-gen/actions/effect';
import { Link, useLocalSearchParams, router } from 'expo-router'; 
import { useQuery } from '@tanstack/react-query';
import { getEventById, checkUserEventAccess } from '../../../services/events';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import AssetItem from '../../../components/AssetItem';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../providers/AuthProvider';

export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const { data: event, 
    isLoading, 
    error } = useQuery({
    queryKey: ['events', id],
    queryFn: () => getEventById(id!),
  });

  const { data: hasAccess, isLoading: accessLoading } = useQuery({
    queryKey: ['event-access', id, user?.id],
    queryFn: () => checkUserEventAccess(id!, user?.id!),
    enabled: !!user?.id && !!id,
  });
  if (isLoading || accessLoading) {
    return (
      <LinearGradient
        colors={['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
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
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!event) {
    return (
      <LinearGradient
        colors={['#06b6d4', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </LinearGradient>
    );
  }

  // Check if user has access to view this event
  if (hasAccess === false) {
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
          <Text style={styles.errorSubtext}>You don't have permission to view this event</Text>
        </View>
      </LinearGradient>
    );
  }

  console.log('Event data:', event);
  console.log('Assets array:', event.assets);
  console.log('Assets length:', event.assets?.length);

  return (
    <LinearGradient
      colors={['#06b6d4', '#3b82f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Stack.Screen 
        options={{ 
          title: event.name,
          headerStyle: {
            backgroundColor: 'black',
          },
          headerTitleStyle: {
            color: 'white',
            fontSize: 18,
          },
          headerTintColor: 'white',
          headerBackTitle: '',
          headerLeft: undefined, // Let expo-router handle the back button
          headerRight: () => (
            <Pressable onPress={() => {
              // Always navigate to join page for consistency
              // The join page will handle different states (owner, member, non-member)
              router.push(`/event/${id}/join`);
            }}>
              <Ionicons name="share-outline" size={24} color='white' />
            </Pressable>
          )
        }}
        />
        <FlatList
          data={event.assets || []}
          renderItem={({ item, index }) => {
            console.log(`Rendering asset ${index + 1}/${event.assets?.length}:`, item);
            return <AssetItem asset={item as any} />;
          }}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          ListHeaderComponent={() => (
            <Text style={styles.debugText}>
              Total assets: {event.assets?.length || 0}
            </Text>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No photos yet</Text>
              <Text style={styles.emptySubtext}>Take some photos to see them here!</Text>
            </View>
          )}
        />
      </View>
      <Link href={`/event/${id}/camera`} asChild>
        <Pressable style={styles.floatingButton}>
          <Ionicons name="camera-outline" size={32} color="white" />
        </Pressable>
      </Link>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 8,
  },
  flatListContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-around',
    paddingHorizontal: 2,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
});
