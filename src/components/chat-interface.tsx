
"use client";
import type * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardHeader, CardTitle } from "@/components/ui/card"; // Removed Card, CardContent, CardFooter as they are part of the overall app structure
import { Send, MessageSquare, User, Bot, Loader2, VenetianMask, Sparkles, Brain, ShieldAlert, ChevronsUpDown, PanelLeftClose, PanelRightOpen } from 'lucide-react';
import { chatWithAI, type ChatAssistantInput, type ChatAssistantOutput, type UserTier } from '@/ai/flows/chat-assistant-flow';
import { toast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from './ui/badge';
import { Label } from './ui/label';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  id: string;
}

interface ChatInterfaceProps {
  userTier: UserTier;
  isTrialActive: boolean;
}

export function ChatInterface({ userTier, isTrialActive }: ChatInterfaceProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isCanvasCollapsed, setIsCanvasCollapsed] = useState(false);

  const isAdmin = userTier === 'admin';

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageToSend = currentMessage.trim();
    if (!messageToSend) return;

    const userMessage: ChatMessage = { role: 'user', content: messageToSend, id: Date.now().toString() };
    setChatHistory(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Prepare history for Genkit flow, ensuring it matches ChatMessageSchema (role, content only)
      const flowHistory = chatHistory.slice(-10).map(h => ({ 
        role: h.role, 
        content: h.content 
      }));
      // Add the current user message to the history being sent to the flow
      flowHistory.push({ role: 'user', content: messageToSend });


      const input: ChatAssistantInput = {
        message: messageToSend,
        history: flowHistory,
        userTier,
      };
      const result = await chatWithAI(input);
      const aiMessage: ChatMessage = { role: 'model', content: result.response, id: (Date.now() + 1).toString() };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Chat error:", error);
      toast({ title: "Error", description: "Failed to get AI response. Please try again.", variant: "destructive" });
      const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again.", id: (Date.now() + 1).toString() };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierDisplayName = () => {
    if (isAdmin) return { name: "Admin Cortex Mode", icon: <Brain className="w-4 h-4 mr-1.5" />, variant: "destructive" as const };
    if (isTrialActive) return { name: "Trial Full Access", icon: <Sparkles className="w-4 h-4 mr-1.5" />, variant: "default" as const };
    switch (userTier) {
      case 'paid_weekly':
      case 'paid_monthly':
        return { name: "Premium Access", icon: <Sparkles className="w-4 h-4 mr-1.5" />, variant: "default" as const };
      case 'free_limited':
        return { name: "Free Limited Tier", icon: <ShieldAlert className="w-4 h-4 mr-1.5" />, variant: "secondary" as const };
      default:
        return { name: "Standard Access", icon: <MessageSquare className="w-4 h-4 mr-1.5" />, variant: "outline" as const };
    }
  };
  
  const tierInfo = getTierDisplayName();

  const cortexCanvasPlaceholder = `// Conceptual output area for Cortex OS
// Example: A requested Python script might appear here.

function helloWorld() {
  console.log('Hello from Cortex Canvas!');
}

// Or a Mermaid diagram definition:
// graph TD;
//   A-->B;
//   A-->C;
//   B-->D;
//   C-->D;

// --- Puppeteer Browser Automation Examples ---

// -- Firefox Example --
// import puppeteer from 'puppeteer'; // Assumes puppeteer is installed server-side

// async function runFirefoxAutomation() {
//   const firefoxBrowser = await puppeteer.launch({
//     product: 'firefox', // WebDriver BiDi is used by default for Firefox.
//   });
//   const ffPage = await firefoxBrowser.newPage();
//   await ffPage.goto('https://example.org');
//   console.log('Firefox Page Title:', await ffPage.title());
//   // ... more actions like screenshots, data extraction, etc.
//   await firefoxBrowser.close();
// }
// runFirefoxAutomation();


// -- Chrome Example with WebDriver BiDi --
// import puppeteer from 'puppeteer'; // Assumes puppeteer is installed server-side

// async function runChromeAutomation() {
//   const chromeBrowser = await puppeteer.launch({
//     product: 'chrome',
//     protocol: 'webDriverBiDi', // Explicitly use WebDriver BiDi (CDP is default for Chrome)
//   });
//   const chPage = await chromeBrowser.newPage();
//   await chPage.goto('https://pptr.dev');
//   console.log('Chrome Page Title:', await chPage.title());
//   // ... more actions
//   await chromeBrowser.close();
// }
// runChromeAutomation();
`;

  return (
    <div className="flex flex-col h-full p-1 md:p-2 bg-transparent">
        <CardHeader className="px-2 py-3 text-center border-b border-border/30">
          <div className="flex items-center justify-center mb-1">
              <MessageSquare className="w-7 h-7 mr-2 text-primary" />
              <CardTitle className="text-xl radiant-text">AI Chat</CardTitle>
          </div>
          <div className="flex items-center justify-center">
            <Badge variant={tierInfo.variant} className="text-xs">
                {tierInfo.icon}
                {tierInfo.name}
            </Badge>
          </div>
          {userTier === 'free_limited' && !isTrialActive && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Limited capabilities. <Button variant="link" size="sm" className="p-0 h-auto text-xs text-accent" onClick={() => toast({title: "Upgrade Options", description: "Subscription options would be shown here."})}>Upgrade</Button> for full access.
            </p>
          )}
           {isTrialActive && !isAdmin && (
            <p className="text-xs text-accent mt-1.5">
              Full access trial active! Explore all features.
            </p>
          )}
        </CardHeader>

      <div className={`flex flex-1 min-h-0 ${isAdmin ? 'flex-row' : 'flex-col'}`}>
        <div className="flex flex-col flex-grow">
            <ScrollArea className="flex-grow p-2 -m-2 my-2" ref={scrollAreaRef}>
            <div className="space-y-4 p-2">
                {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end max-w-[80%] p-0`}>
                    {msg.role === 'model' && <Bot className="w-6 h-6 mr-2 self-start text-primary shrink-0" />}
                    <div className={`px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground button-3d-interactive shadow-md' : 'bg-secondary text-secondary-foreground glassmorphic shadow-md'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && <User className="w-6 h-6 ml-2 self-start text-accent shrink-0" />}
                    </div>
                </div>
                ))}
                {isLoading && (
                <div className="flex justify-start">
                    <div className={`flex items-end max-w-[80%] p-0`}>
                    <Bot className="w-6 h-6 mr-2 self-start text-primary shrink-0" />
                    <div className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground glassmorphic shadow-md">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                    </div>
                </div>
                )}
            </div>
            </ScrollArea>
        
            <form onSubmit={handleSubmit} className="flex items-center p-2 space-x-2 border-t border-border/30 shrink-0">
            <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder={isAdmin ? "Enter directive for Cortex OS..." : "Type your message..."}
                className="flex-grow bg-input/70 focus:bg-input"
                disabled={isLoading}
                onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                }
                }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !currentMessage.trim()} className="button-3d-interactive">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
            </form>
        </div>

        {isAdmin && (
            <div className={`flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isCanvasCollapsed ? 'w-12' : 'w-1/3 min-w-[280px] max-w-md'} border-l border-border/30 ml-2`}>
                <div className="flex items-center justify-between p-2 border-b border-border/30 shrink-0 bg-muted/30">
                    {!isCanvasCollapsed && <Label htmlFor="code-canvas" className="text-sm font-medium text-accent radiant-text">Cortex Canvas</Label>}
                    <Button variant="ghost" size="icon" onClick={() => setIsCanvasCollapsed(!isCanvasCollapsed)} className="button-3d-interactive">
                        {isCanvasCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                    </Button>
                </div>
                {!isCanvasCollapsed && (
                    <div className="p-2 flex-grow flex flex-col glassmorphic bg-background/30 overflow-y-auto">
                        <Textarea 
                            id="code-canvas" 
                            placeholder="Cortex Engine: Generated code, web previews, or system schematics will render here. Interact with tools and manage project files." 
                            rows={10} 
                            className="mt-1 text-xs bg-input/70 focus:bg-input flex-grow resize-none" 
                            readOnly 
                            value={cortexCanvasPlaceholder}
                        />
                        <p className="text-xs text-muted-foreground mt-1 shrink-0">This area represents where complex code, previews, or diagrams would be rendered for admin users.</p>
                    </div>
                )}
                 {isCanvasCollapsed && (
                    <div className="flex items-center justify-center flex-grow">
                        <ChevronsUpDown className="w-6 h-6 text-muted-foreground transform -rotate-90" />
                    </div>
                )}
            </div>
        )}
      </div>
      
      <div className="p-2 text-center border-t border-border/30 shrink-0">
        <p className="text-xs text-muted-foreground">
          {isAdmin ? "Cortex Engine: Full agentic capabilities active with interactive canvas." : 
           (userTier === 'free_limited' && !isTrialActive) ? "Free tier: Basic chat. Upgrade for code generation." :
           "AI responses are generated and may require review."}
        </p>
      </div>
    </div>
  );
}

    

    

    