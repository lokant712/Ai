import { supabase } from '../lib/supabase';

/**
 * Utility to check and display profile data for debugging
 * This helps identify if address data exists in the database
 */
export async function checkProfileData(userId) {
  try {
    console.log('🔍 Checking profile data for user:', userId);
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching profile:', error);
      return { success: false, error: error.message };
    }

    console.log('📋 Full profile data:', profile);
    console.log('📍 Address Information:', {
      address: profile?.address || '(empty)',
      city: profile?.city || '(empty)',
      state: profile?.state || '(empty)',
      zip_code: profile?.zip_code || '(empty)'
    });

    const hasAddressData = !!(profile?.address || profile?.city || profile?.state || profile?.zip_code);
    
    if (hasAddressData) {
      console.log('✅ Address data exists in database');
    } else {
      console.log('⚠️ No address data found in database for this user');
      console.log('💡 You can add address data by clicking "Edit Profile" and filling in the address fields');
    }

    return {
      success: true,
      profile,
      hasAddressData
    };
  } catch (error) {
    console.error('❌ Error in checkProfileData:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update address data for existing user
 * Use this if you need to manually add address data
 */
export async function updateAddressData(userId, addressData) {
  try {
    console.log('📝 Updating address data for user:', userId);
    console.log('📍 New address data:', addressData);

    const updateData = {
      address: addressData.address || null,
      city: addressData.city || null,
      state: addressData.state || null,
      zip_code: addressData.zipCode || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating address:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Address data updated successfully');
    console.log('📋 Updated profile:', data);

    return {
      success: true,
      profile: data
    };
  } catch (error) {
    console.error('❌ Error in updateAddressData:', error);
    return { success: false, error: error.message };
  }
}
