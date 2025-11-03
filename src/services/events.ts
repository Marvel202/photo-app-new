import { supabase } from '../lib/supabase';
import { TablesInsert } from '../types/database.types';

export async function getEvents() {
    const { data } = await supabase.from('events').select('*').throwOnError();
    return data;
}

export async function getUserEvents(userId: string) {
    console.log('Fetching events for user:', userId);
    
    try {
        // Get events where user is the owner
        const { data: ownedEvents, error: ownedError } = await supabase
            .from('events')
            .select('*')
            .eq('owner_id', userId);
            
        if (ownedError) {
            console.error('Error fetching owned events:', ownedError);
            throw ownedError;
        }
        
        // Get event IDs where user is a member
        const { data: memberships, error: membershipError } = await supabase
            .from('event_memberships')
            .select('event_id')
            .eq('user_id', userId);
            
        if (membershipError) {
            console.error('Error fetching memberships:', membershipError);
            throw membershipError;
        }
        
        // Get events where user is a member (but not owner to avoid duplicates)
        const memberEventIds = memberships?.map(m => m.event_id) || [];
        let memberEvents: any[] = [];
        
        if (memberEventIds.length > 0) {
            const { data: memberEventsData, error: memberEventsError } = await supabase
                .from('events')
                .select('*')
                .in('id', memberEventIds)
                .neq('owner_id', userId); // Exclude owned events to avoid duplicates
                
            if (memberEventsError) {
                console.error('Error fetching member events:', memberEventsError);
                throw memberEventsError;
            }
            
            memberEvents = memberEventsData || [];
        }
        
        // Combine owned and member events
        const allEvents = [...(ownedEvents || []), ...memberEvents];
        
        // Sort by creation date (newest first)
        allEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        console.log('User events found:', {
            owned: ownedEvents?.length || 0,
            member: memberEvents.length,
            total: allEvents.length
        });
        
        return allEvents;
    } catch (error) {
        console.error('Unexpected error in getUserEvents:', error);
        throw error;
    }
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

export async function checkEventMembership(eventId: string, userId: string) {
    console.log('checkEventMembership called with:', { eventId, userId });
    
    try {
        // First check if user is the owner of the event
        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('owner_id')
            .eq('id', eventId)
            .single();
            
        if (eventError) {
            console.error('Error checking event ownership:', eventError);
            throw eventError;
        }
        
        // If user is the owner, they are automatically a member
        if (eventData.owner_id === userId) {
            console.log('User is event owner, automatically a member');
            return true;
        }
        
        // Check regular membership
        const { data, error } = await supabase
            .from('event_memberships')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();
        
        // If we get data, user is a member. If error with PGRST116 (no rows), user is not a member
        if (error && error.code !== 'PGRST116') {
            console.error('Error checking membership:', error);
            throw error;
        }
        
        const isMember = !!data;
        console.log('Membership check result:', { isMember, isOwner: false, data });
        return isMember;
    } catch (error) {
        console.error('Unexpected error in checkEventMembership:', error);
        throw error;
    }
}

export async function joinEvent(eventId: string, userId: string) {
    console.log('joinEvent called with:', { eventId, userId });
    
    try {
        const { data, error } = await supabase
            .from('event_memberships')
            .insert({ event_id: eventId, user_id: userId })
            .select()
            .single()
            .throwOnError();
        return data;
    } catch (error) {
        console.error('Unexpected error in joinEvent:', error);
        throw error;
    }
}

export async function checkUserEventAccess(eventId: string, userId: string) {
    console.log('checkUserEventAccess called with:', { eventId, userId });
    
    try {
        // Check if user is the owner of the event
        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('owner_id')
            .eq('id', eventId)
            .single();
            
        if (eventError) {
            if (eventError.code === 'PGRST116') {
                // Event not found
                return false;
            }
            console.error('Error checking event ownership:', eventError);
            throw eventError;
        }
        
        // If user is the owner, they have access
        if (eventData.owner_id === userId) {
            console.log('User is event owner, has access');
            return true;
        }
        
        // Check if user is a member
        const { data: membershipData, error: membershipError } = await supabase
            .from('event_memberships')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();
        
        // If we get data, user is a member. If error with PGRST116 (no rows), user is not a member
        if (membershipError && membershipError.code !== 'PGRST116') {
            console.error('Error checking membership:', membershipError);
            throw membershipError;
        }
        
        const hasAccess = !!membershipData;
        console.log('User event access check result:', { hasAccess, isMember: hasAccess, isOwner: false });
        return hasAccess;
    } catch (error) {
        console.error('Unexpected error in checkUserEventAccess:', error);
        throw error;
    }
}