
"use client";
import type * as React from 'react';
import { ChatInterface } from './chat-interface';
import { useAuth } from '@/contexts/AuthContext';
// Removed Card, CardHeader, CardTitle, CardDescription as ChatInterface handles its own presentation
// import { BotMessageSquare } from 'lucide-react'; // Icon is handled in DesktopEnvironment

export function AgenticTerminalApp() {
  const { currentUser } = useAuth();

  // Determine user tier and trial status to pass to ChatInterface
  const userTier = currentUser?.subscriptionTier || 'free_limited';
  const isTrialActive = currentUser?.isTrialActive || false;

  return (
    <div className="flex flex-col w-full h-full bg-card text-card-foreground rounded-md overflow-hidden">
      {/* 
        The ChatInterface component is designed to be self-contained, 
        including its own header with title and tier information.
        Thus, no additional header is needed here for AgenticTerminalApp.
        It will adapt its display based on the userTier and isTrialActive props.
      */}
      <ChatInterface userTier={userTier} isTrialActive={isTrialActive} />
    </div>
  );
}
