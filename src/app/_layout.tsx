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
                            options={{ title: 'Events', headerLargeTitle: true }} />
                            <Stack.Screen 
                            name="camera"
                            options={{ 
                                title: 'Camera', 
                                headerBackButtonDisplayMode: 'minimal', 
                                headerTransparent: true,
                                headerBlurEffect: 'dark',
                                headerRight: () => (
                                    <Link href="/" className="mr-2 ml-2">
                                        <Ionicons name="share-outline" size={24} color="white" />
                                    </Link>
                                )
                            }} />
                      </Stack>
                 </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}