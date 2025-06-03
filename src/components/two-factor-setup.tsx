
"use client";

import type * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BinaryBlocksphereIcon } from "@/components/icons/BinaryBlocksphereIcon";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldCheck, Copy, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

// This is a placeholder QR code image.
// In a real app, you'd generate this dynamically (e.g., with qrcode.react or a backend service)
// using an otpauth:// URI.
const PLACEHOLDER_QR_CODE_URL = "https://placehold.co/200x200.png?text=Scan+Me+(Fake)";
const FAKE_RECOVERY_CODE = "BBS-FAKE-RECOVERY-A1B2-C3D4-E5F6";

export default function TwoFactorSetup() {
  const { currentUser, complete2FASetup } = useAuth();

  const handleCopyRecoveryCode = () => {
    navigator.clipboard.writeText(FAKE_RECOVERY_CODE)
      .then(() => toast({ title: "Copied!", description: "Recovery code copied to clipboard." }))
      .catch(() => toast({ title: "Error", description: "Could not copy recovery code.", variant: "destructive" }));
  };

  if (!currentUser) {
     // Should not happen if routing is correct, redirect or show error
    return <p>Error: No user context for 2FA setup.</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      <Card className="w-full max-w-lg glassmorphic">
        <CardHeader className="items-center text-center">
          <ShieldCheck className="w-12 h-12 mb-4 text-primary" />
          <CardTitle className="text-2xl radiant-text">Setup Two-Factor Authentication</CardTitle>
          <CardDescription className="radiant-text">
            Enhance your account security, {currentUser.username}.
            This is a simulated setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="radiant-text mb-2">1. Scan this QR code with your authenticator app:</p>
            <div className="flex justify-center my-4">
                <Image
                    src={PLACEHOLDER_QR_CODE_URL}
                    alt="Simulated QR Code for 2FA"
                    width={180}
                    height={180}
                    className="rounded-md border border-primary/50 shadow-lg"
                    data-ai-hint="qr code"
                />
            </div>
            <p className="text-xs text-muted-foreground radiant-text">(This is a placeholder QR code for demonstration.)</p>
          </div>

          <div className="space-y-2">
            <p className="radiant-text">2. Save this recovery code in a safe place:</p>
            <div className="p-3 bg-muted/50 rounded-md flex items-center justify-between">
              <pre className="font-mono text-sm text-accent radiant-text">{FAKE_RECOVERY_CODE}</pre>
              <Button variant="ghost" size="icon" onClick={handleCopyRecoveryCode} title="Copy recovery code" className="button-3d-interactive">
                <Copy className="w-4 h-4"/>
              </Button>
            </div>
             <p className="text-xs text-muted-foreground radiant-text">(This is a fake recovery code.)</p>
          </div>

          <div className="p-3 border border-destructive/50 bg-destructive/10 rounded-md text-destructive text-sm flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 shrink-0 mt-0.5"/>
            <div>
                <strong>Important:</strong> This 2FA setup is simulated for demonstration.
                For actual login, you will use the code: <strong className="text-foreground bg-destructive/30 px-1 rounded">123456</strong>.
                Do not use real authenticator apps with this simulation.
            </div>
          </div>

          <Button onClick={complete2FASetup} className="w-full button-3d-interactive">
            I have saved my recovery code and understand this is a simulation. Continue.
          </Button>
        </CardContent>
         <CardFooter className="flex-col items-center space-y-3 pt-6">
          <div className="flex items-center text-xs text-muted-foreground radiant-text pt-2">
            <BinaryBlocksphereIcon className="w-4 h-4 mr-1.5 text-primary" />
            BinaryBlocksphere Secure Setup
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

    