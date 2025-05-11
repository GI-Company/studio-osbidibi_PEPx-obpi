
"use client";

import type * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BinaryBlocksphereIcon } from "@/components/icons/BinaryBlocksphereIcon";
import { useAuth } from "@/contexts/AuthContext";
import { Fingerprint, Database, Server } from 'lucide-react';

export default function LaunchModeSelector() {
  const { selectMode } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      <Card className="w-full max-w-md glassmorphic">
        <CardHeader className="items-center text-center">
          <BinaryBlocksphereIcon className="w-16 h-16 mb-4 text-primary" />
          <CardTitle className="text-2xl radiant-text">BinaryBlocksphere</CardTitle>
          <CardDescription>Select Operating Mode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            variant="outline" 
            className="w-full h-auto py-4 text-left flex items-start space-x-3 hover:bg-primary/10 group"
            onClick={() => selectMode('persistent')}
          >
            <Database className="w-8 h-8 mt-1 text-primary group-hover:text-accent transition-colors" />
            <div>
              <p className="font-semibold text-base text-foreground group-hover:text-accent transition-colors">Persistent Mode</p>
              <p className="text-sm text-muted-foreground">
                Your session and data will be saved. Requires user account creation or login.
              </p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-auto py-4 text-left flex items-start space-x-3 hover:bg-primary/10 group"
            onClick={() => selectMode('ghost')}
          >
            <Fingerprint className="w-8 h-8 mt-1 text-primary group-hover:text-accent transition-colors" />
            <div>
              <p className="font-semibold text-base text-foreground group-hover:text-accent transition-colors">Ghost Mode (No Fingerprint)</p>
              <p className="text-sm text-muted-foreground">
                Operate without saving data. All changes are temporary and lost upon closing the session.
              </p>
            </div>
          </Button>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground justify-center">
          <Server className="w-3 h-3 mr-1.5"/>
          BinaryBlocksphere Instance v0.5.0
        </CardFooter>
      </Card>
    </div>
  );
}
