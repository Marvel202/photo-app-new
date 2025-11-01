import { supabase } from '../lib/supabase';
import { TablesInsert } from '../types/database.types';

export async function getEvents() {
    const { data } = await supabase.from('events').select('*').throwOnError();
    return data;
}

export async function getEventById(id: string) {
    console.log('Fetching event with ID:', id);
    const { data } = await supabase
        .from('events')
        .select(`
            *,
            assets (*)
        `)
        .eq('id', id)
        .throwOnError()
        .single();
    
    console.log('Raw event data from Supabase:', data);
    console.log('Assets in response:', data?.assets);
    console.log('Number of assets found:', data?.assets?.length);
    
    return data;
}   

export async function createEvent(newEvent: TablesInsert<"events">) {
    console.log('createEvent called with:', newEvent);
    
    try {
        const { data, error } = await supabase
            .from('events')
            .insert(newEvent)
            .select()
            .single();
        
        if (error) {
            console.error('Supabase error creating event:', error);
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }
        
        console.log('Event created successfully:', data);
        return data;
    } catch (error) {
        console.error('Unexpected error in createEvent:', error);
        throw error;
    }
}