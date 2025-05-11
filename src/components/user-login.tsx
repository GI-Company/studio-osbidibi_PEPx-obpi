"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BinaryBlocksphereIcon } from "@/components/icons/BinaryBlocksphereIcon";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Eye, EyeOff, UserPlus } from 'lucide-react'; // Added UserPlus
import { toast } from '@/hooks/use-toast';

export default function UserLogin() {
  const { login, resetToModeSelection, switchToOnboarding } = useAuth(); // Added switchToOnboarding
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(username, password);
    if (!success) {
      setIsLoading(false); 
    }
    // setIsLoading will be managed by auth state changes implicitly
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      <Card className="w-full max-w-md glassmorphic">
        <CardHeader className="items-center text-center">
          <LogIn className="w-12 h-12 mb-4 text-primary" />
          <CardTitle className="text-2xl radiant-text">Login</CardTitle>
          <CardDescription className="radiant-text">Access Your BinaryBlocksphere Persistent Environment</CardDescription>
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
              />
               <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-7 h-7 w-7 button-3d-interactive" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button type="submit" className="w-full button-3d-interactive" disabled={isLoading}>
              {isLoading ? "Logging In..." : "Login"}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex-col items-center space-y-3 pt-4">
           <Button variant="link" size="sm" onClick={switchToOnboarding} className="text-primary radiant-text button-3d-interactive">
             <UserPlus className="w-4 h-4 mr-2"/> Create an account
           </Button>
           <Button variant="link" size="sm" onClick={resetToModeSelection} className="text-muted-foreground radiant-text button-3d-interactive">
            Back to Mode Selection
          </Button>
          <div className="flex items-center text-xs text-muted-foreground radiant-text pt-2">
            <BinaryBlocksphereIcon className="w-4 h-4 mr-1.5 text-primary" />
            BinaryBlocksphere Secure Login
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}