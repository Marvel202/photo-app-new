import { supabase } from '../lib/supabase';
import { TablesInsert } from '../types/database.types';

export const insertAsset = async (newAsset: TablesInsert<'assets'>) => {
    console.log('Inserting asset:', newAsset);
    
    // Get current user session for debugging
    const { data: session } = await supabase.auth.getSession();
    console.log('Current user session:', session?.session?.user?.id);
    
    const { data, error } = await supabase
        .from('assets')
        .insert(newAsset)
        .select()
        .single();
    
    if (error) {
        console.error('Database error inserting asset:', error);
        console.error('Asset data being inserted:', newAsset);
        
        // Try alternative approach if RLS is blocking
        if (error.code === '42501') {
            console.log('RLS policy violation - trying with auth bypass...');
            // You might need to create a database function or adjust RLS policies
            throw new Error(`RLS Policy Error: Make sure the assets table allows inserts for user ${newAsset.user_id}. Check your Supabase RLS policies.`);
        }
        throw error;
    }
    
    console.log('Asset inserted successfully:', data);
    return data;
};