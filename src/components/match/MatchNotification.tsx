
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { checkForPendingMatch, clearPendingMatch } from '@/lib/supabase';
import { Bell } from 'lucide-react';

interface MatchNotificationProps {
  userId: string;
  pollingInterval?: number; // in milliseconds
}

interface MatchData {
  matcher_id: string;
  matcher_name: string;
  matcher_avatar: string;
  room_id: string;
  created_at: string;
}

const MatchNotification: React.FC<MatchNotificationProps> = ({
  userId,
  pollingInterval = 5000, // Check every 5 seconds by default
}) => {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [notificationShown, setNotificationShown] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check for pending match notifications
  useEffect(() => {
    if (!userId) return;

    const checkMatches = async () => {
      try {
        const match = await checkForPendingMatch(userId);
        
        if (match && !notificationShown) {
          setMatchData(match);
          setNotificationShown(true);
          
          // Show toast notification
          toast.custom((t) => (
            <div className={`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ${t.dismissed ? 'animate-leave' : 'animate-enter'}`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5 mr-3">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={match.matcher_avatar || '/placeholder.svg'}
                      alt=""
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Match found! {match.matcher_name} wants to connect
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Click Join to start video chatting right away!
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex">
                <Button
                  className="flex px-4 py-0 m-2 border text-sm font-medium bg-ivy hover:bg-ivy-dark"
                  onClick={() => handleJoinCall(match)}
                >
                  Join
                </Button>
              </div>
            </div>
          ), {
            duration: 20000, // 20 seconds
            id: `match-${match.room_id}`,
          });
        }
      } catch (error) {
        console.error("Error checking for matches:", error);
      }
    };

    // Check immediately
    checkMatches();
    
    // Set up interval for periodic checking
    const interval = setInterval(checkMatches, pollingInterval);
    
    return () => clearInterval(interval);
  }, [userId, notificationShown, pollingInterval, navigate]);

  const handleJoinCall = async (match: MatchData) => {
    try {
      // Clear the notification
      await clearPendingMatch(userId);
      setMatchData(null);
      setNotificationShown(false);
      
      // Navigate to the match page
      navigate('/match', {
        state: {
          targetUserId: match.matcher_id,
          roomId: match.room_id
        }
      });
    } catch (error) {
      console.error("Error joining call:", error);
      toast.error("Failed to join call. Please try again.");
    }
  };

  // Render a notification bell that pulses when there's a match
  return (
    <div className="relative">
      {matchData && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
      )}
      <Bell 
        className={`h-6 w-6 ${matchData ? 'text-ivy animate-pulse' : 'text-gray-500'}`}
        onClick={() => {
          if (matchData) {
            handleJoinCall(matchData);
          }
        }}
        style={{ cursor: matchData ? 'pointer' : 'default' }}
      />
    </div>
  );
};

export default MatchNotification;
