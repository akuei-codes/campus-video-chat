import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, MessageSquare, UserPlus, Settings, LogOut } from 'lucide-react';
import { signOut } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/App';

const Navbar = () => {
  const { user, setUser } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      toast.success('Signed out successfully');
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-ivy">IvyTV</span>
          </Link>
          {user && (
            <nav className="hidden md:flex gap-6">
              <Link 
                to="/match" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/match' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Match
              </Link>
              <Link 
                to="/network" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/network' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                My Network
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture || ''} alt={user.user_metadata?.full_name || ''} />
                    <AvatarFallback className="bg-ivy text-ivy-foreground">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/match" className="cursor-pointer flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Match
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/network" className="cursor-pointer flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Network
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link to="/login">
                <Button className="bg-ivy hover:bg-ivy-dark">Join Now</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
