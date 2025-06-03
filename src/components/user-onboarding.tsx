
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BinaryBlocksphereIcon } from "@/components/icons/BinaryBlocksphereIcon";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Eye, EyeOff, LogIn, Info, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function UserOnboarding() {
  const { onboardUser, resetToModeSelection, authStatus, selectMode } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [projectInterest, setProjectInterest] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    // onboardUser will now transition to 'needs_2fa_setup' on success
    await onboardUser(username, password, projectInterest);
    setIsLoading(false);
  };

  const switchToLogin = () => {
    if (authStatus !== 'needs_login') {
        selectMode('persistent');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      <Card className="w-full max-w-lg glassmorphic">
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-7 h-7 w-7 button-3d-interactive"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="projectInterest" className="radiant-text flex items-center">
                <Info className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                Primary Interest / Project Type (Optional)
              </Label>
              <Textarea
                id="projectInterest"
                value={projectInterest}
                onChange={(e) => setProjectInterest(e.target.value)}
                className="mt-1"
                placeholder="e.g., Web Development, AI Research, Game Design, Cloud Infrastructure..."
                rows={2}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full button-3d-interactive" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account & Setup 2FA"}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex-col items-center space-y-3 pt-6">
           <Button variant="link" size="sm" onClick={switchToLogin} className="text-primary radiant-text button-3d-interactive" disabled={isLoading}>
             <LogIn className="w-4 h-4 mr-2"/> Already have an account? Login
           </Button>
           <Button variant="link" size="sm" onClick={resetToModeSelection} className="text-muted-foreground radiant-text button-3d-interactive" disabled={isLoading}>
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

    