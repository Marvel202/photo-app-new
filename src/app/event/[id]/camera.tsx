import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Pressable} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { insertAsset } from '../../../services/assets';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../providers/AuthProvider';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();


  const insertAssetMutation = useMutation({
    mutationFn: (assetData: { event_id: string; user_id: string; asset_id: string }) => insertAsset(assetData),
    onSuccess: (data) => {
      console.log('Asset saved to database:', data);
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    },
    onError: (error) => {
      console.error('Error saving asset to database:', error);
    }
  });

  const camera = useRef<CameraView>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <ActivityIndicator />;
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
    try {
      console.log('Taking photo...');
      const photo = await camera.current?.takePictureAsync();
      console.log('Photo taken:', photo?.uri);
      
      if (!photo?.uri) {
        console.log('No photo URI available');
        return;
      }

      console.log('Uploading to Cloudinary...');
      const cloudinaryResponse = await uploadToCloudinary(photo.uri);
      console.log('Cloudinary response:', cloudinaryResponse);

      if (!cloudinaryResponse?.public_id) {
        console.error('No public_id in Cloudinary response');
        return;
      }

      if (!user?.id || !id) {
        console.error('Missing user ID or event ID:', { userId: user?.id, eventId: id });
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
    }
  }  
  return (
    <View style={styles.container}>
      <CameraView ref={camera} style={styles.camera} facing={facing} />
      
      {/* Camera controls overlay */}
      <SafeAreaView 
        edges={['bottom']}
        style={styles.controlsContainer}
      >      
        <View style={styles.buttonContainer}>
          {/* Capture button */}
          <Pressable 
            style={styles.captureButton}
            onPress={takePhoto}
          >
            <View style={styles.captureButtonInner} />
          </Pressable>
          
          {/* Flip camera button */}
          <TouchableOpacity 
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons 
              name="camera-reverse" 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
});
