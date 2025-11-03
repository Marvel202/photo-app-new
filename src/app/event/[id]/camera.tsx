import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRef, useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Pressable, Alert, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { insertAsset } from '../../../services/assets';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../../providers/AuthProvider';
import { checkUserEventAccess } from '../../../services/events';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Animation values
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const previewScale = useRef(new Animated.Value(0)).current;

  // Check if user has access to this event
  const { data: hasAccess, isLoading: accessLoading } = useQuery({
    queryKey: ['event-access', id, user?.id],
    queryFn: () => checkUserEventAccess(id!, user?.id!),
    enabled: !!user?.id && !!id,
  });


  const insertAssetMutation = useMutation({
    mutationFn: (assetData: { event_id: string; user_id: string; asset_id: string }) => insertAsset(assetData),
    onSuccess: (data) => {
      console.log('Asset saved to database:', data);
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] }); // Refresh user's events list
      
      // Show success with option to take another or go back
      Alert.alert(
        "Photo Saved! 📸", 
        "Your photo has been added to the event.", 
        [
          {
            text: "Take Another",
            style: "default",
            onPress: () => {
              setCapturedPhotoUri(null);
              setIsProcessing(false);
            }
          },
          {
            text: "View Event",
            style: "default", 
            onPress: () => router.back()
          }
        ]
      );
    },
    onError: (error) => {
      console.error('Error saving asset to database:', error);
      setIsProcessing(false);
      setCapturedPhotoUri(null);
      Alert.alert("Error", "Failed to save photo to the event. Please try again.");
    }
  });

  // Flash animation effect
  const triggerFlash = () => {
    setShowFlash(true);
    Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowFlash(false));
  };

  // Preview animation
  const animatePreview = () => {
    previewScale.setValue(0);
    Animated.spring(previewScale, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const camera = useRef<CameraView>(null);

  if (accessLoading || !permission) {
    // Access or camera permissions are still loading.
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.message}>Loading...</Text>
      </View>
    );
  }

  // Check if user has access to take photos in this event
  if (hasAccess === false) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="lock-closed" size={48} color="#FFA500" />
          <Text style={styles.accessDeniedText}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtext}>You need to be a member of this event to take photos</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }
  async function takePhoto() {
    // Prevent multiple taps while processing
    if (isProcessing) {
      return;
    }

    try {
      console.log('Taking photo...');
      setIsProcessing(true);
      
      // Trigger flash effect immediately for user feedback
      triggerFlash();
      
      if (!camera.current) {
        console.error('Camera reference not available');
        setIsProcessing(false);
        return;
      }
      
      const photo = await camera.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });
      
      console.log('Photo taken:', photo?.uri);
      
      if (!photo?.uri) {
        console.error('No photo URI available');
        setIsProcessing(false);
        return;
      }

      // Show captured photo immediately
      setCapturedPhotoUri(photo.uri);
      animatePreview();

      console.log('Uploading to Cloudinary...');
      const cloudinaryResponse = await uploadToCloudinary(photo.uri);
      console.log('Cloudinary response:', cloudinaryResponse);

      if (!cloudinaryResponse?.public_id) {
        console.error('No public_id in Cloudinary response');
        setIsProcessing(false);
        setCapturedPhotoUri(null);
        Alert.alert("Upload Error", "Failed to upload photo. Please try again.");
        return;
      }

      if (!user?.id || !id) {
        console.error('Missing user ID or event ID:', { userId: user?.id, eventId: id });
        setIsProcessing(false);
        setCapturedPhotoUri(null);
        return;
      }

      console.log('Saving to database with:', {
        event_id: id,
        user_id: user.id,
        asset_id: cloudinaryResponse.public_id,
        userObject: user
      });
      
      insertAssetMutation.mutate({
        event_id: id,
        user_id: user.id,
        asset_id: cloudinaryResponse.public_id
      });
    } catch (error) {
      console.error('Error in takePhoto:', error);
      setIsProcessing(false);
      setCapturedPhotoUri(null);
      
      // Show user-friendly error message
      let errorMessage = "Failed to take photo. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Camera')) {
          errorMessage = "Camera error. Please ensure you have granted camera permissions and try again.";
        } else if (error.message.includes('Cloudinary')) {
          errorMessage = "Failed to upload photo. Please check your internet connection.";
        } else if (error.message.includes('database') || error.message.includes('asset')) {
          errorMessage = "Failed to save photo. Please try again.";
        }
      }
      
      Alert.alert("Photo Error", errorMessage);
    }
  }  
  return (
    <View style={styles.container}>
      <CameraView ref={camera} style={styles.camera} facing={facing} />
      
      {/* Flash overlay */}
      {showFlash && (
        <Animated.View 
          style={[
            styles.flashOverlay, 
            { opacity: flashOpacity }
          ]} 
        />
      )}
      
      {/* Photo preview */}
      {capturedPhotoUri && (
        <Animated.View 
          style={[
            styles.photoPreview,
            {
              transform: [{ scale: previewScale }]
            }
          ]}
        >
          <Image 
            source={{ uri: capturedPhotoUri }} 
            style={styles.previewImage}
          />
          <View style={styles.previewOverlay}>
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.processingText}>Saving...</Text>
              </View>
            ) : (
              <View style={styles.previewActions}>
                <TouchableOpacity 
                  style={styles.retakeButton}
                  onPress={() => {
                    setCapturedPhotoUri(null);
                    setIsProcessing(false);
                  }}
                >
                  <Ionicons name="refresh" size={24} color="white" />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      )}
      
      {/* Camera controls overlay */}
      {!capturedPhotoUri && (
        <SafeAreaView 
          edges={['bottom']}
          style={styles.controlsContainer}
        >      
          <View style={styles.buttonContainer}>
            {/* Capture button */}
            <Pressable 
              style={[
                styles.captureButton,
                isProcessing && styles.captureButtonDisabled
              ]}
              onPress={takePhoto}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </Pressable>
            
            {/* Flip camera button */}
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={toggleCameraFacing}
              disabled={isProcessing}
            >
              <Ionicons 
                name="camera-reverse" 
                size={24} 
                color={isProcessing ? "rgba(255,255,255,0.5)" : "white"} 
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  flipButton: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 10,
  },
  photoPreview: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    zIndex: 5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  processingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  previewActions: {
    alignItems: 'center',
    gap: 8,
  },
  retakeButton: {
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  retakeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  accessDeniedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
  },
  accessDeniedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  accessDeniedSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
});
