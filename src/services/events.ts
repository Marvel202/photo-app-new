import { supabase } from '../lib/supabase';

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