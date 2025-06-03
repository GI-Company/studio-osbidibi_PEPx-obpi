
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BinaryBlocksphereIcon } from "@/components/icons/BinaryBlocksphereIcon";
import { useAuth } from "@/contexts/AuthContext";
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function TwoFactorAuth() {
  const { verify2FA, pending2FAUser, logout } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast({ title: "Error", description: "Please enter your 2FA code.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    await verify2FA(code);
    // AuthContext will handle transition to 'authenticated' or show error toast
    setIsLoading(false);
  };

  if (!pending2FAUser) {
    // This case should ideally not be reached if routing is correct,
    // but it's a good fallback.
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4">
            <Card className="w-full max-w-md glassmorphic">
                 <CardHeader className="items-center text-center">
                    <CardTitle className="text-xl radiant-text text-destructive">Error</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-center text-muted-foreground radiant-text">No user pending 2FA verification. Please try logging in again.</p>
                 </CardContent>
                 <CardFooter>
                    <Button onClick={logout} className="w-full button-3d-interactive">Back to Login</Button>
                 </CardFooter>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      <Card className="w-full max-w-md glassmorphic">
        <CardHeader className="items-center text-center">
          <KeyRound className="w-12 h-12 mb-4 text-primary" />
          <CardTitle className="text-2xl radiant-text">Two-Factor Authentication</CardTitle>
          <CardDescription className="radiant-text">
            Enter the code from your authenticator app for user: <span className="font-semibold text-accent">{pending2FAUser.username}</span>.
            <br/>(Simulated: Use code "123456")
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="2fa-code" className="radiant-text">Authentication Code</Label>
              <Input
                id="2fa-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter 6-digit code"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full button-3d-interactive" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2"/> : null}
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex-col items-center space-y-3 pt-6">
           <Button variant="link" size="sm" onClick={logout} className="text-muted-foreground radiant-text button-3d-interactive" disabled={isLoading}>
            Cancel and Logout
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

    