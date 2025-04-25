import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { Code, Video, Brush, Music, Star, ChevronDown, LogOut, User, Settings, Plus } from "lucide-react";
import MobileFooter from "./mobile-footer";

const Navbar = () => {
  const { user, logoutMutation } = useAuth();
  const isMobile = useMobile();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      <nav className="bg-card border-b border-muted sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/">
                  <div className="text-accent font-bold text-2xl flex items-center">
                    <span className="text-primary">Dev</span>Challenge
                    <span className="ml-2 bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text text-sm font-bold px-2 py-1 rounded-md border border-muted">BETA</span>
                  </div>
                </Link>
              </div>
              <div className="hidden md:flex ml-10 space-x-6">
                <Link href="/compete">
                  <a className={`text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center ${location === '/compete' ? 'text-primary' : ''}`}>
                    <Code className="h-4 w-4 mr-1" />
                    Compete
                  </a>
                </Link>
                <Link href="/vote">
                  <a className={`text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center ${location === '/vote' ? 'text-primary' : ''}`}>
                    <Star className="h-4 w-4 mr-1" />
                    Vote
                  </a>
                </Link>
                <Link href="/leaderboard">
                  <a className={`text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center ${location === '/leaderboard' ? 'text-primary' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="8" width="4" height="12" />
                      <rect x="10" y="4" width="4" height="16" />
                      <rect x="18" y="12" width="4" height="8" />
                    </svg>
                    Leaderboard
                  </a>
                </Link>
                <Link href="/guild">
                  <a className={`text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center ${location === '/guild' ? 'text-primary' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Guilds
                  </a>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Button className="bg-primary hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-1" /> New Challenge
                </Button>
              </div>
              {user && (
                <div className="ml-4 flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 bg-muted p-2 rounded-md hover:bg-muted/80 transition-colors">
                        <Avatar className="h-8 w-8 border-2 border-primary">
                          <AvatarImage src={user.avatarUrl || ""} />
                          <AvatarFallback className="bg-muted">{getInitials(user.username)}</AvatarFallback>
                        </Avatar>
                        <div className="hidden md:block text-left">
                          <div className="text-sm font-medium">{user.username}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <span className="flex items-center mr-1">
                              <Star className="h-3 w-3 text-warning mr-0.5" />
                              {user.eloRating}
                            </span>
                            <span className="text-success">Lv.{user.level}</span>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <a className="flex items-center cursor-pointer w-full">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu for active page indicator */}
        {isMobile && (
          <div className="md:hidden border-t border-muted">
            <MobileFooter />
          </div>
        )}
      </nav>
      
      {/* Mobile floating action button */}
      {isMobile && (
        <div className="fixed bottom-20 right-6 md:hidden z-40">
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
  );
};

export default Navbar;
