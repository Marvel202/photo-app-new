import { Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

export default function Share() {
 return (
   <LinearGradient
     colors={['#06b6d4', '#3b82f6']}
     start={{ x: 0, y: 0 }}
     end={{ x: 1, y: 0 }}
     style={styles.container}
   >
     <View style={styles.content}>
       <Text style={styles.title}>Share Event with your friends</Text>
       <Text>
         <QRCode
           value="http://awesome.link.qr"
           size={200}
           backgroundColor="white"
           color="black"
         />
       </Text>

       <Text style={styles.instructions}>
         Scan this QR code to join the event
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
});
   