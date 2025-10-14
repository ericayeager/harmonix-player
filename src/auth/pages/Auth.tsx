import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Check } from "lucide-react";
import { validateEmail, validatePassword, AUTH_ERRORS } from "../lib/utils";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [cooldownTimer, setCooldownTimer] = useState<number>(0);
  const [signinErrors, setSigninErrors] = useState<string[]>([]);
  const [signinWarning, setSigninWarning] = useState<string | null>(null);
  const [signupErrors, setSignupErrors] = useState<string[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        localStorage.setItem("auth-user", JSON.stringify({ id: session.user.id, email: session.user.email }));
        navigate("/");
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        localStorage.setItem("auth-user", JSON.stringify({ id: session.user.id, email: session.user.email }));
        navigate("/");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setSigninErrors([]);
    setSigninWarning(null);

    if (!email || !password) {
      setSigninErrors(["Please fill in all fields"]);
      return;
    }

    // Non-blocking password strength warning
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.isValid) {
      setSigninWarning('Password looks weak — consider using at least 8 characters, with letters, numbers and symbols');
    }
    setLoading(true);
    try {
      const resp = await supabase.auth.signInWithPassword({ email, password });
      console.log("signIn response data:", resp?.data);
      console.log("signIn response error:", resp?.error);
      
      const { data, error } = resp;
      
      if (error) {
        // Handle specific error cases
        if (error.message?.includes("Invalid login credentials")) {
          setSigninErrors(["Invalid email or password. Please try again."]);
          toast.error("Invalid email or password. Please try again.");
        } else if (error.message?.includes("Email not confirmed")) {
          setSigninErrors(["Please confirm your email address first. Check your inbox for the confirmation link."]);
          toast.error("Please confirm your email address first. Check your inbox for the confirmation link.", { duration: 6000 });
        } else if (error.status === 429) {
          setSigninErrors(["Too many attempts — please wait and try again later"]);
          toast.error("Too many attempts. Please try again in a minute.");
        } else {
          const msg = error.message || "Failed to sign in";
          setSigninErrors([msg]);
          toast.error(msg);
        }
        return;
      }

      if (!data?.session?.user) {
        toast.error("No session created. Please try again.");
        return;
      }

      // Clear any errors and store user data and navigate
      setSigninErrors([]);
      setSigninWarning(null);
      localStorage.setItem(
        "auth-user", 
        JSON.stringify({ 
          id: data.session.user.id, 
          email: data.session.user.email,
          lastSignIn: new Date().toISOString()
        })
      );
      
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      console.error("signIn exception:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setSignupErrors([]);

    // Basic validation using shared utils
    if (!email || !password || !confirmPassword) {
      setSignupErrors(["Please fill in all fields"]);
      return;
    }

    // Email validation
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setSignupErrors([emailCheck.error || AUTH_ERRORS.INVALID_EMAIL]);
      return;
    }

    // Password validation
    if (password !== confirmPassword) {
      setSignupErrors(["Passwords do not match"]);
      return;
    }
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.isValid) {
      // Combine errors into a helpful inline message with suggestions
      const primary = pwdCheck.errors.join('; ');
      const suggestion = pwdCheck.suggestions.length ? ` Suggestions: ${pwdCheck.suggestions.join('; ')}` : '';
      setSignupErrors([`${AUTH_ERRORS.WEAK_PASSWORD}: ${primary}.${suggestion}`]);
      return;
    }

    // Check cooldown
    if (cooldownTimer > 0) {
      toast.error(`Please wait ${cooldownTimer} seconds before trying again`);
      return;
    }

    setLoading(true);
    try {
      const resp = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: `${window.location.origin}/#/`,
          data: {
            signupDate: new Date().toISOString()
          }
        }
      });
      
  console.log("signUp response data:", resp?.data);
  console.log("signUp response error:", resp?.error);

  const { error, data } = resp as any;
      
      if (error) {
        // Handle specific error cases
        if (error.message?.includes("security purposes") || error.status === 429) {
          const waitTime = parseInt(error.message?.match(/\d+/)?.[0] || "60");
          setCooldownTimer(waitTime);
          
          const interval = setInterval(() => {
            setCooldownTimer(prev => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          toast.error(`Too many attempts. Please wait ${waitTime} seconds before trying again.`);
        } else if (error.message?.toLowerCase().includes("already registered") || error.message?.toLowerCase().includes('user already exists')) {
          setSignupErrors([AUTH_ERRORS.USER_EXISTS + ". Please sign in instead."]);
          toast.error(AUTH_ERRORS.USER_EXISTS + ". Please sign in instead.");
        } else if (error.message?.toLowerCase().includes("invalid email")) {
          setSignupErrors([AUTH_ERRORS.INVALID_EMAIL]);
          toast.error(AUTH_ERRORS.INVALID_EMAIL);
        } else if (error.status === 0) {
          setSignupErrors([AUTH_ERRORS.NETWORK_ERROR]);
          toast.error(AUTH_ERRORS.NETWORK_ERROR);
        } else {
          // Generic fallback with helpful debug info
          const debug = error.message ? ` (${error.message})` : '';
          setSignupErrors([`${AUTH_ERRORS.UNKNOWN}${debug}`]);
          toast.error(`${AUTH_ERRORS.UNKNOWN}${debug}`);
        }
        return;
      }

      // If Supabase returned a user but no session, it's likely because email confirmation is required.
      if (data?.user && !data?.session) {
        // Inform user inline as well as with a toast
        setSignupErrors([]);
        toast.success('Account created. Please check your email to confirm before signing in.');
      }

  // Clear form on success
  setEmail("");
  setPassword("");
  setConfirmPassword("");
  setSignupErrors([]);

      // Show confirmation needed message
      toast.success(
        "Account created! Please check your email to confirm your registration before signing in.", 
        { 
          duration: 8000,
          description: "The confirmation link will expire in 24 hours."
        }
      );

      // Switch to sign in tab after short delay
      setTimeout(() => {
        const signinTab = document.querySelector('[value="signin"]') as HTMLElement;
        if (signinTab) signinTab.click();
      }, 2000);

    } catch (err) {
      console.error("signUp exception:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-4 animate-fade-in">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome</h1>
          <p className="text-muted-foreground">Sign in to continue to your account</p>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl animate-glow">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-foreground">Authentication</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Choose your preferred method
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="bg-background/50 border-input" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="bg-background/50 border-input" />
                  </div>

                  {signinWarning && (
                    <div className="text-yellow-400 text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{signinWarning}</span>
                    </div>
                  )}

                  {signinErrors.length > 0 && (
                    <ul className="text-red-400 text-sm list-disc pl-5">
                      {signinErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}

                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                    {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>) : ("Sign In")}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      disabled={loading || cooldownTimer > 0} 
                      className="bg-background/50 border-input" 
                    />
                  </div>

                  {signupErrors.length > 0 && (
                    <ul className="text-red-400 text-sm list-disc pl-5">
                      {signupErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      disabled={loading || cooldownTimer > 0} 
                      className="bg-background/50 border-input" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      disabled={loading || cooldownTimer > 0} 
                      className="bg-background/50 border-input" 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                    disabled={loading || cooldownTimer > 0}
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                    ) : cooldownTimer > 0 ? (
                      `Please wait ${cooldownTimer}s...`
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">Protected by Supabase authentication</p>
      </div>
    </div>
  );
};

export default Auth;
