
import { createClient } from '@supabase/supabase-js';
import { Profile, User, MatchFilters } from '../types';

// Use hard-coded values if environment variables are not available
const supabaseUrl = 'https://frosefrpajavyosbolfq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`, // Changed from /profile to / (home page)
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  
  if (error) throw error;

  // Set online status after successful login
  if (data) {
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.user) {
      await updatePresenceStatus(session.data.session.user.id, 'online');
    }
  }

  return data;
}

export async function signOut() {
  // Update presence status to offline before signing out
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await updatePresenceStatus(user.id, 'offline');
  }
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  
  // Update presence status to online
  await updatePresenceStatus(data.user.id, 'online');
  
  return data.user as User;
}

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return null;
  return data as Profile;
}

export async function createProfile(profile: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile])
    .select()
    .single();
  
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(profile: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', profile.id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Profile;
}

export async function uploadProfilePhoto(userId: string, file: File, index: number | string = 0): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${index}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from('profile_photos')
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('profile_photos').getPublicUrl(filePath);
  return data.publicUrl;
}

// Network functions
export async function getConnections(profileId: string): Promise<Profile[]> {
  // Get all connections where the user is either user1 or user2
  const { data: connections, error } = await supabase
    .from('connections')
    .select('user1_id, user2_id')
    .or(`user1_id.eq.${profileId},user2_id.eq.${profileId}`);
  
  if (error || !connections) return [];
  
  // Extract the other user's ID from each connection
  const connectionIds = connections.map(conn => 
    conn.user1_id === profileId ? conn.user2_id : conn.user1_id
  );
  
  if (connectionIds.length === 0) return [];
  
  // Get all profiles for these connections
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', connectionIds);
  
  if (profileError || !profiles) return [];
  
  return profiles as Profile[];
}

export async function getIncomingFriendRequests(profileId: string) {
  const { data, error } = await supabase
    .from('friend_requests')
    .select(`
      id,
      status,
      created_at,
      sender:sender_id (
        id,
        full_name,
        university,
        avatar_url
      )
    `)
    .eq('receiver_id', profileId)
    .eq('status', 'pending');
    
  if (error) throw error;
  return data || [];
}

export async function getSentFriendRequests(profileId: string) {
  const { data, error } = await supabase
    .from('friend_requests')
    .select(`
      id,
      status,
      created_at,
      receiver:receiver_id (
        id,
        full_name,
        university,
        avatar_url
      )
    `)
    .eq('sender_id', profileId)
    .eq('status', 'pending');
    
  if (error) throw error;
  return data || [];
}

export async function sendFriendRequest(senderId: string, receiverId: string) {
  const { data, error } = await supabase
    .from('friend_requests')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId
    })
    .select();
    
  if (error) throw error;
  return data;
}

export async function respondToFriendRequest(requestId: string, status: 'accepted' | 'rejected') {
  const { data, error } = await supabase
    .from('friend_requests')
    .update({ status })
    .eq('id', requestId)
    .select();
    
  if (error) throw error;
  
  if (status === 'accepted') {
    const request = data[0];
    
    // Create a connection between the users
    await supabase.from('connections').insert({
      user1_id: request.sender_id,
      user2_id: request.receiver_id
    });
  }
  
  return data;
}

export async function searchProfiles(query: string, excludeIds: string[] = []): Promise<Profile[]> {
  // Search for profiles by name or university
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,university.ilike.%${query}%`)
    .not('id', 'in', `(${excludeIds.join(',')})`);
    
  if (error) throw error;
  return data as Profile[] || [];
}

// Get online users with filtering
export async function getOnlineUsers(currentUserId: string, filters?: MatchFilters): Promise<Profile[]> {
  // Get users with 'online' or 'matching' status excluding the current user
  let query = supabase
    .from('presence')
    .select('user_id')
    .in('status', ['online', 'matching'])
    .neq('user_id', currentUserId);
  
  const { data: onlineUserIds, error } = await query;
  
  if (error || !onlineUserIds || onlineUserIds.length === 0) {
    return [];
  }
  
  // Get profiles for online users
  let profileQuery = supabase
    .from('profiles')
    .select('*')
    .in('user_id', onlineUserIds.map(u => u.user_id));
  
  // Apply filters if provided
  if (filters) {
    if (filters.university) {
      profileQuery = profileQuery.eq('university', filters.university);
    }
    
    if (filters.gender) {
      profileQuery = profileQuery.eq('gender', filters.gender);
    }
    
    if (filters.major) {
      profileQuery = profileQuery.eq('major', filters.major);
    }
    
    if (filters.graduationYear) {
      profileQuery = profileQuery.eq('graduation_year', filters.graduationYear);
    }
  }
  
  const { data: profiles, error: profileError } = await profileQuery;
  
  if (profileError || !profiles) {
    return [];
  }
  
  return profiles as Profile[];
}

// Presence functions
export async function updatePresenceStatus(userId: string, status: 'online' | 'matching' | 'in_call' | 'idle' | 'offline') {
  const { error } = await supabase
    .from('presence')
    .upsert({
      user_id: userId,
      status: status,
      last_seen: new Date().toISOString()
    });
  
  if (error) throw error;
  return true;
}

// Video room functions
export async function createVideoRoom(user1Id: string, user2Id: string) {
  const roomToken = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
  
  // Check if room already exists between these users
  const { data: existingRoom, error: findError } = await supabase
    .from('video_rooms')
    .select('*')
    .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (findError) throw findError;
  
  // If room exists, return it
  if (existingRoom && existingRoom.length > 0) {
    return existingRoom[0];
  }
  
  // Otherwise create a new room
  const { data, error } = await supabase
    .from('video_rooms')
    .insert({
      room_token: roomToken,
      user1_id: user1Id,
      user2_id: user2Id,
      status: 'active'
    })
    .select();
    
  if (error) throw error;
  return data[0];
}

export async function endVideoRoom(roomId: string) {
  const { error } = await supabase
    .from('video_rooms')
    .update({
      status: 'ended',
      ended_at: new Date().toISOString()
    })
    .eq('id', roomId);
    
  if (error) throw error;
  return true;
}

// Report function
export async function submitReport(reportData: {
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  details?: string;
  room_id?: string;
}) {
  const { data, error } = await supabase
    .from('reports')
    .insert(reportData)
    .select();
    
  if (error) throw error;
  return data[0];
}
