import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/login');
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed out successfully');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark p-4">
      <div className="text-center animate-fade-in">
        <div className="mb-8">
          <h1 className="mb-4 text-5xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-xl text-muted-foreground">You're successfully logged in!</p>
        </div>
        
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-lg p-8 mb-6 animate-slide-up">
          <p className="text-sm text-muted-foreground mb-2">Logged in as:</p>
          <p className="text-lg text-foreground font-medium">{user.email}</p>
        </div>

        <Button 
          onClick={handleSignOut}
          variant="outline"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Index;
