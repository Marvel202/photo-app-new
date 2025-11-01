import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createEvent } from '@/services/events';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function CreateEvent() {
    const [name, setName] = useState('');
    const queryClient = useQueryClient();
    const { user } = useAuth();
    
    const createEventMutation = useMutation({
        mutationFn: (variables: { name: string }) => {
            console.log('Creating event with user:', user?.id);
            console.log('Event data:', { name: variables.name, owner_id: user?.id });
            return createEvent({ name: variables.name, owner_id: user?.id || null });
        },
        onSuccess: (data) => {
            console.log('Event created successfully:', data);
            // Invalidate events query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['events'] });
            
            Alert.alert(
                "Event Created", 
                "Your event has been created successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Navigate back to events list
                            router.back();
                        }
                    }
                ]
            );
        },
        onError: (error: any) => {
            console.error('Full error object:', error);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
            console.error('Error hint:', error.hint);
            console.error('Error code:', error.code);
            
            let errorMessage = "There was an error creating your event. Please try again.";
            
            // Provide more specific error messages
            if (error.message?.includes('owner_id')) {
                errorMessage = "Authentication error. Please try logging in again.";
            } else if (error.message?.includes('name')) {
                errorMessage = "Invalid event name. Please choose a different name.";
            } else if (error.code === 'PGRST301') {
                errorMessage = "Database connection error. Please check your internet connection.";
            }
            
            Alert.alert("Error", errorMessage);
        }
    });

    const handleCreateEvent = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter an event name");
            return;
        }

        if (!user?.id) {
            console.log('No user ID found. User object:', user);
            Alert.alert("Error", "You must be logged in to create an event. Please try logging in again.");
            return;
        }

        console.log('=== EVENT CREATION DEBUG INFO ===');
        console.log('Event name:', name.trim());
        console.log('User ID:', user.id);
        console.log('Full user object:', user);
        
        // Test current session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Current session:', sessionData);
        
        createEventMutation.mutate({ name: name.trim() });
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <LinearGradient
                colors={['#06b6d4', '#3b82f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Ionicons name="calendar-outline" size={48} color="white" />
                            <Text style={styles.title}>Create New Event</Text>
                            <Text style={styles.subtitle}>Give your event a memorable name</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Event name..."
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    autoFocus
                                    returnKeyType="done"
                                    onSubmitEditing={handleCreateEvent}
                                    editable={!createEventMutation.isPending}
                                />
                            </View>

                            <TouchableOpacity 
                                style={[
                                    styles.createButton,
                                    createEventMutation.isPending && styles.disabledButton
                                ]} 
                                onPress={handleCreateEvent}
                                disabled={createEventMutation.isPending}
                            >
                                <LinearGradient
                                    colors={createEventMutation.isPending ? 
                                        ['rgba(255,140,0,0.5)', 'rgba(255,215,0,0.5)'] : 
                                        ['#FF8C00', '#FFD700']
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    {createEventMutation.isPending ? (
                                        <>
                                            <Ionicons name="hourglass" size={24} color="white" />
                                            <Text style={styles.buttonText}>Creating...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="add-circle" size={24} color="white" />
                                            <Text style={styles.buttonText}>Create Event</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 300,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 4,
  },
  createButton: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});