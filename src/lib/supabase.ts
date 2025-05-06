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

export async function searchProfiles(query: string = "", excludeIds: string[] = []): Promise<Profile[]> {
  // Updated to fetch all profiles when query is empty
  let queryBuilder = supabase
    .from('profiles')
    .select('*');
  
  // Only apply search filter if query is provided
  if (query.trim()) {
    queryBuilder = queryBuilder.or(`full_name.ilike.%${query}%,university.ilike.%${query}%`);
  }
  
  // Exclude specified IDs
  if (excludeIds.length > 0) {
    queryBuilder = queryBuilder.not('id', 'in', `(${excludeIds.join(',')})`);
  }
  
  const { data, error } = await queryBuilder;
  
  if (error) throw error;
  return data as Profile[] || [];
}

// Get online users with filtering - fixed query
export async function getOnlineUsers(currentUserId: string, filters?: MatchFilters): Promise<Profile[]> {
  try {
    console.log("Fetching online users, excluding:", currentUserId);
    
    // Query presence table first to get online user IDs
    const { data: presenceData, error: presenceError } = await supabase
      .from('presence')
      .select('user_id, status, last_seen')
      .or('status.eq.online,status.eq.matching')
      .neq('user_id', currentUserId);
    
    if (presenceError) {
      console.error("Error fetching presence data:", presenceError);
      return [];
    }
    
    if (!presenceData || presenceData.length === 0) {
      console.log("No online users found");
      return [];
    }
    
    // Extract user IDs
    const onlineUserIds = presenceData.map(p => p.user_id);
    console.log("Found online user IDs:", onlineUserIds);
    
    // Then query profiles for these online users
    let profileQuery = supabase
      .from('profiles')
      .select('*')
      .in('user_id', onlineUserIds);
    
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
    
    const { data: profilesData, error: profileError } = await profileQuery;
    
    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      return [];
    }
    
    console.log(`Found ${profilesData?.length || 0} online profiles matching criteria`);
    return profilesData || [];
  } catch (error) {
    console.error("Error in getOnlineUsers:", error);
    return [];
  }
}

// Add a new search function for user discovery
export async function searchAllProfiles(query: string = "", currentUserId: string): Promise<Profile[]> {
  try {
    // Basic query to get all profiles except the current user
    let searchQuery = supabase
      .from('profiles')
      .select('*')
      .neq('user_id', currentUserId);
    
    // Add search filter if provided
    if (query && query.trim() !== '') {
      searchQuery = searchQuery.or(`full_name.ilike.%${query}%,university.ilike.%${query}%,major.ilike.%${query}%`);
    }
    
    const { data, error } = await searchQuery;
    
    if (error) {
      console.error("Error searching profiles:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in searchAllProfiles:", error);
    return [];
  }
}

// Add a function to check if two users are connected
export async function checkConnection(userId1: string, userId2: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
      .single();
    
    if (error) {
      // If no connection found, this will error but that's expected
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking connection:", error);
    return false;
  }
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

// Message functions
export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      read: false
    })
    .select();
    
  if (error) throw error;
  return data[0];
}

export async function getMessages(userId: string, otherId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
    .order('created_at');
    
  if (error) throw error;
  return data || [];
}

export async function markMessagesAsRead(userId: string, otherId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', otherId)
    .eq('receiver_id', userId)
    .eq('read', false);
    
  if (error) throw error;
  return true;
}

export async function getUnreadMessageCount(userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('receiver_id', userId)
    .eq('read', false);
    
  if (error) throw error;
  return data?.length || 0;
}

// Simplified function to notify of friend requests without using notifications table
export async function notifyUserOfFriendRequest(senderId: string, receiverId: string) {
  // This function is now just a placeholder since notifications table doesn't exist
  // In a real implementation, this would create a notification
  console.log(`Notification: User ${senderId} sent a friend request to ${receiverId}`);
  return true;
}

// Placeholder function that returns an empty array since notifications table doesn't exist
export async function getUserNotifications(userId: string) {
  console.log(`[Info] Attempted to get notifications for user ${userId}, but notifications table doesn't exist`);
  return [];
}

// Placeholder function that returns true since notifications table doesn't exist
export async function markNotificationAsRead(notificationId: string) {
  console.log(`[Info] Attempted to mark notification ${notificationId} as read, but notifications table doesn't exist`);
  return true;
}

// Placeholder function that returns 0 since notifications table doesn't exist
export async function getUnreadNotificationsCount(userId: string) {
  console.log(`[Info] Attempted to get unread notification count for user ${userId}, but notifications table doesn't exist`);
  return 0;
}

// Add a new function to notify users about matches
export async function notifyUserOfMatch(
  matcherId: string,
  matchedUserId: string, 
  roomId: string
) {
  try {
    // Get the matcher's profile for the notification
    const { data: matcherProfile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', matcherId)
      .single();
    
    if (!matcherProfile) {
      console.error('Matcher profile not found');
      return false;
    }
    
    // Store the match notification in presence table's metadata
    // This is a workaround since we don't have a notifications table
    const { error } = await supabase
      .from('presence')
      .update({
        status: 'matching',
        last_seen: new Date().toISOString(),
        metadata: {
          match_notification: {
            matcher_id: matcherId,
            matcher_name: matcherProfile.full_name,
            matcher_avatar: matcherProfile.avatar_url,
            room_id: roomId,
            created_at: new Date().toISOString()
          }
        }
      })
      .eq('user_id', matchedUserId);
    
    if (error) {
      console.error('Error sending match notification:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in notifyUserOfMatch:', error);
    return false;
  }
}

// Add function to check if user has pending match
export async function checkForPendingMatch(userId: string) {
  try {
    const { data, error } = await supabase
      .from('presence')
      .select('metadata')
      .eq('user_id', userId)
      .single();
    
    if (error || !data || !data.metadata || !data.metadata.match_notification) {
      return null;
    }
    
    return data.metadata.match_notification;
  } catch (error) {
    console.error('Error checking for pending match:', error);
    return null;
  }
}

// Add function to clear pending match notification
export async function clearPendingMatch(userId: string) {
  try {
    const { error } = await supabase
      .from('presence')
      .update({
        metadata: {}
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error clearing pending match:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in clearPendingMatch:', error);
    return false;
  }
}
