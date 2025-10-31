import { View, Text, StyleSheet } from 'react-native';
import { AdvancedImage } from 'cloudinary-react-native';
import { cloudinary } from '../lib/cloudinary';
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { artisticFilter } from '@cloudinary/url-gen/actions/effect';

export default function Event() {
  // Create the image with basic transformations available in @cloudinary/url-gen
  const myImage = cloudinary
    .image('photo-app/opikezbbpwexrndvawou')
    .format('auto')
    .quality('auto')
    .effect(artisticFilter('peacock'));

  console.log('Generated Cloudinary URL:', myImage.toURL());

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event</Text>
      <AdvancedImage
        cldImg={myImage}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 8,
  },
});
