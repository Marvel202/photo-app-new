import { Text, TouchableOpacity, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Tables } from '../types/database.types';

type Event = Tables<'events'>;

type EventListItemProps = {
    event: Tables<'events'>;
};

export default function EventListItem({event}: EventListItemProps) {
    return (
        <TouchableOpacity style={styles.eventItem} activeOpacity={0.7}>
            <View style={styles.eventHeader}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventDate}>
                    {new Date(event.created_at).toLocaleDateString()}
                </Text>
            </View>
            
            <View style={styles.eventActions}>
                <Link href={`/event/${event.id}/camera`} asChild>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                        <Ionicons name="camera" size={18} color="rgba(255, 255, 255, 0.9)" />
                        <Text style={styles.actionText}>Camera</Text>
                    </TouchableOpacity>
                </Link>
                <Link href={`/event/${event.id}`} asChild>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                        <Ionicons name="eye" size={18} color="rgba(255, 255, 255, 0.9)" />
                        <Text style={styles.actionText}>View</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    eventItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glass transparency effect
        borderRadius: 12,
        padding: 16,
        marginVertical: 6,
        marginHorizontal: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#06b6d4',
        // Glass morphism effect with shadow
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        // Additional glass effect
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.18)',
    },
    eventHeader: {
        marginBottom: 12,
    },
    eventName: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    eventDate: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    eventActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    actionButton: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minWidth: 80,
    },
    actionText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12,
        fontWeight: '500',
    },
});
