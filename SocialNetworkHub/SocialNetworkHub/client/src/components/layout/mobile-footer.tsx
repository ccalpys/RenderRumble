import { Link, useLocation } from "wouter";
import { Code, Star, BarChart, Users } from "lucide-react";

const MobileFooter = () => {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-muted z-40">
      <div className="flex justify-around">
        <Link href="/compete">
          <a className={`py-3 text-center flex-1 flex flex-col items-center text-xs ${location === '/compete' ? 'text-primary border-t-2 border-primary bg-muted' : 'text-muted-foreground'}`}>
            <Code className="h-5 w-5 mb-1" />
            Compete
          </a>
        </Link>
        <Link href="/vote">
          <a className={`py-3 text-center flex-1 flex flex-col items-center text-xs ${location === '/vote' ? 'text-primary border-t-2 border-primary bg-muted' : 'text-muted-foreground'}`}>
            <Star className="h-5 w-5 mb-1" />
            Vote
          </a>
        </Link>
        <Link href="/leaderboard">
          <a className={`py-3 text-center flex-1 flex flex-col items-center text-xs ${location === '/leaderboard' ? 'text-primary border-t-2 border-primary bg-muted' : 'text-muted-foreground'}`}>
            <BarChart className="h-5 w-5 mb-1" />
            Ranks
          </a>
        </Link>
        <Link href="/guild">
          <a className={`py-3 text-center flex-1 flex flex-col items-center text-xs ${location === '/guild' ? 'text-primary border-t-2 border-primary bg-muted' : 'text-muted-foreground'}`}>
            <Users className="h-5 w-5 mb-1" />
            Guilds
          </a>
        </Link>
      </div>
    </div>
  );
};

export default MobileFooter;
