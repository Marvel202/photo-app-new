import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { AdvancedImage } from 'cloudinary-react-native';
import { cloudinary } from '../lib/cloudinary';
import { thumbnail } from '@cloudinary/url-gen/actions/resize';
import { artisticFilter } from '@cloudinary/url-gen/actions/effect';
import { Ionicons } from '@expo/vector-icons';
import { Tables } from '@/types/database.types';


interface Asset {
  id: string;
  public_id: string;
  created_at: string;
  event_id: string;
}

//interface AssetItemProps {
//  asset: Asset;
//}

export default function AssetItem({ asset }: {asset: Tables<'assets'>}) {
  const { width } = useWindowDimensions();
  // Calculate column width for 2-column layout (with padding and gap)
  const columnWidth = (width - 60) / 2; // 60 = padding(40) + gap(20)
  
  // Create the image with transformations
  const image = cloudinary
    .image(asset.asset_id!)
    .format('auto')
    .quality('auto')
    .resize(thumbnail().width(300).height(400)).effect(artisticFilter('al_dente'));
    
  console.log('Image URL:', image.toURL());
  console.log('Asset ID:', asset.asset_id);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <AdvancedImage
          cldImg={image}
          style={styles.image}
        />
        <View style={styles.overlay}>
          <View style={styles.infoContainer}>
            <Text style={styles.dateText}>
              {new Date(asset.created_at).toLocaleDateString()}
            </Text>
            <Text style={styles.timeText}>
              {new Date(asset.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 1,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 3/4,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '400',
  },
  timeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9,
  },
});