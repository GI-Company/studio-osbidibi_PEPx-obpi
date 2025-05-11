
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BinaryBlocksphereIcon } from "@/components/icons/BinaryBlocksphereIcon";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Eye, EyeOff, Mail, LogIn } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function UserOnboarding() {
  const { onboardUser, resetToModeSelection, signInWithProvider, authStatus, selectMode } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters long.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    await onboardUser(username, password);
    // setIsLoading will be managed by auth state changes implicitly
    setIsLoading(false);
  };

  const handleSocialSignup = async (provider: 'google' | 'microsoft' | 'yahoo') => {
    setIsSocialLoading(provider);
    await signInWithProvider(provider); // Using signInWithProvider for social signup too for this stubbed version
    setIsSocialLoading(null);
  };

  const switchToLogin = () => {
    // This function should navigate to the login screen.
    // Assuming 'persistent' mode if on onboarding page.
    if (authStatus !== 'needs_login') {
        selectMode('persistent'); // This will set authStatus to 'needs_login'
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      <Card className="w-full max-w-md glassmorphic">
        <CardHeader className="items-center text-center">
          <UserPlus className="w-12 h-12 mb-4 text-primary" />
          <CardTitle className="text-2xl radiant-text">Create Account</CardTitle>
          <CardDescription className="radiant-text">Join BinaryBlocksphere Persistent Environment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="radiant-text">Username</Label>
              <Input 
                id="username" 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                className="mt-1"
                placeholder="Enter your desired username"
                disabled={isLoading || !!isSocialLoading}
              />
            </div>
            <div className="relative">
              <Label htmlFor="password" className="radiant-text">Password</Label>
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="mt-1 pr-10"
                placeholder="Create a strong password (min 8 chars)"
                disabled={isLoading || !!isSocialLoading}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-7 h-7 w-7 button-3d-interactive" 
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || !!isSocialLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="radiant-text">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                className="mt-1"
                placeholder="Re-enter your password"
                disabled={isLoading || !!isSocialLoading}
              />
            </div>
            <Button type="submit" className="w-full button-3d-interactive" disabled={isLoading || !!isSocialLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <Separator className="flex-grow bg-border/50" />
            <span className="mx-3 text-xs text-muted-foreground radiant-text">OR</span>
            <Separator className="flex-grow bg-border/50" />
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full button-3d-interactive hover:bg-primary/10" 
              onClick={() => handleSocialSignup('google')}
              disabled={isLoading || !!isSocialLoading}
            >
              {isSocialLoading === 'google' ? "Processing..." : (
                <>
                  <Mail className="w-4 h-4 mr-2" /> Sign up with Google (Simulated)
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full button-3d-interactive hover:bg-primary/10" 
              onClick={() => handleSocialSignup('microsoft')}
              disabled={isLoading || !!isSocialLoading}
            >
              {isSocialLoading === 'microsoft' ? "Processing..." : (
                <>
                  <Mail className="w-4 h-4 mr-2" /> Sign up with Microsoft (Simulated)
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full button-3d-interactive hover:bg-primary/10" 
              onClick={() => handleSocialSignup('yahoo')}
              disabled={isLoading || !!isSocialLoading}
            >
              {isSocialLoading === 'yahoo' ? "Processing..." : (
                <>
                  <Mail className="w-4 h-4 mr-2" /> Sign up with Yahoo (Simulated)
                </>
              )}
            </Button>
          </div>


        </CardContent>
        <CardFooter className="flex-col items-center space-y-3 pt-4">
           <Button variant="link" size="sm" onClick={switchToLogin} className="text-primary radiant-text button-3d-interactive" disabled={isLoading || !!isSocialLoading}>
             <LogIn className="w-4 h-4 mr-2"/> Already have an account? Login
           </Button>
           <Button variant="link" size="sm" onClick={resetToModeSelection} className="text-muted-foreground radiant-text button-3d-interactive" disabled={isLoading || !!isSocialLoading}>
            Back to Mode Selection
          </Button>
          <div className="flex items-center text-xs text-muted-foreground radiant-text pt-2">
            <BinaryBlocksphereIcon className="w-4 h-4 mr-1.5 text-primary" />
            BinaryBlocksphere Secure Onboarding
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
