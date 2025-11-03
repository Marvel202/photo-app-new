import { Stack, Link } from 'expo-router';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AuthProvider from '../providers/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {

    useEffect(() => {
        const signInIfNeeded = async () => {
           const { data, error } = await supabase.auth.getSession();
           if (error) {
               console.error('Error getting session:', error);
               return;
           }
           if (!data.session) {
                console.log('No session found, signing in anonymously...');
                const { error: signInError } = await supabase.auth.signInAnonymously();
                if (signInError) {
                    console.error('Anonymous sign-in error:', signInError);
                } else {
                    console.log('Anonymous sign-in successful');
                }
           }
        };
        
        signInIfNeeded();
    }, []);

    return (
        <ThemeProvider value={DarkTheme}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                 <Stack>
                     <Stack.Screen 
                        name="index"
                        options={{ 
                            title: 'Events', 
                            headerLargeTitle: true 
                        }} 
                     />
                     <Stack.Screen 
                        name="event/[id]/index"
                        options={{ 
                            title: 'Event Details', 
                            headerBackButtonDisplayMode: 'minimal', 
                            headerTransparent: false,
                            headerStyle: {
                                backgroundColor: '#06b6d4',
                            },
                            headerTintColor: 'white',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                                color: 'white',
                            },
                        }} 
                     />
                     <Stack.Screen 
                        name="event/[id]/camera"
                        options={{ 
                            title: 'Camera', 
                            headerBackButtonDisplayMode: 'minimal', 
                            headerTransparent: false,
                            headerStyle: {
                                backgroundColor: 'black',
                            },
                            headerTintColor: 'white',
                            headerTitleStyle: {
                                fontWeight: 'bold',
                                color: 'white',
                            },
                        }} 
                     />
              
                 <Stack.Screen 
                        name="event/create"
                        options={{ 
                            title: 'Create Event', 
                            presentation: 'modal',
                        }} 
                     />
                     <Stack.Screen 
                        name="event/[id]/share"
                        options={{ 
                            title: 'Share', 
                            presentation: 'modal',
                        }} 
                     />
                        <Stack.Screen 
                        name="event/[id]/join"
                        options={{ 
                            title: 'Join Event', 
                            presentation: 'modal',
                        }} 
                     />
                    </Stack>
                 </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}