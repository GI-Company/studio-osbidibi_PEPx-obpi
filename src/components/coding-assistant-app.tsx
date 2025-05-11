
"use client";
import type * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Lightbulb, AlertTriangle, Loader2 } from 'lucide-react';
import { assistWithCode, type CodingAssistantInput, type CodingAssistantOutput } from '@/ai/flows/coding-assistant-flow';
import { toast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

export function CodingAssistantApp() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [context, setContext] = useState('');
  const [response, setResponse] = useState<CodingAssistantOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({ title: "Query Empty", description: "Please enter a coding question.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResponse(null);
    try {
      const assistantInput: CodingAssistantInput = { query, programmingLanguage: language || undefined, context: context || undefined };
      const result = await assistWithCode(assistantInput);
      setResponse(result);
    } catch (error) {
      console.error("Coding assistant error:", error);
      toast({ title: "Error", description: "Failed to get assistance. Please try again.", variant: "destructive" });
       setResponse({
        explanation: "An unexpected error occurred while trying to process your request. Please check the console for more details or try again later.",
        potentialIssues: ["Network error or internal server issue."]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-4 overflow-y-auto bg-card text-card-foreground rounded-md">
      <CardHeader className="px-0 pt-0 pb-4 text-center">
        <div className="flex items-center justify-center mb-2">
            <Lightbulb className="w-8 h-8 mr-2 text-primary" />
            <CardTitle className="text-2xl radiant-text">AI Coding Assistant</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Ask any coding question. Provide language and context for better results.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <Label htmlFor="query" className="block mb-1 font-medium radiant-text">Your Question / Problem:</Label>
          <Textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., How do I sort an array in JavaScript?"
            required
            rows={3}
            className="bg-input/70 focus:bg-input"
            disabled={isLoading}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <Label htmlFor="language" className="block mb-1 font-medium radiant-text">Programming Language (Optional):</Label>
            <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g., Python, TypeScript"
                className="bg-input/70 focus:bg-input"
                disabled={isLoading}
            />
            </div>
            <div>
            <Label htmlFor="context" className="block mb-1 font-medium radiant-text">Context / Code Snippet (Optional):</Label>
            <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste any relevant code here..."
                rows={3}
                className="bg-input/70 focus:bg-input"
                disabled={isLoading}
            />
            </div>
        </div>
        <Button type="submit" className="w-full button-3d-interactive" disabled={isLoading}>
          {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : 'Get Assistance'}
        </Button>
      </form>

      {response && (
        <ScrollArea className="flex-grow p-1 -m-1">
            <Card className="glassmorphic bg-background/30">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center radiant-text text-primary"><Lightbulb className="w-6 h-6 mr-2"/>Assistant's Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-lg mb-1 radiant-text text-accent">Explanation:</h4>
                        <p className="text-sm whitespace-pre-wrap">{response.explanation}</p>
                    </div>

                    {response.codeSuggestions && response.codeSuggestions.length > 0 && (
                        <div>
                            <Separator className="my-3 bg-border/50"/>
                            <h4 className="font-semibold text-lg mb-2 flex items-center radiant-text text-accent"><Code2 className="w-5 h-5 mr-2"/>Code Suggestions:</h4>
                            {response.codeSuggestions.map((snippet, index) => (
                                <pre key={index} className="p-3 mb-2 text-sm rounded-md bg-black/50 text-foreground overflow-x-auto">
                                    <code>{snippet}</code>
                                </pre>
                            ))}
                        </div>
                    )}

                    {response.potentialIssues && response.potentialIssues.length > 0 && (
                        <div>
                             <Separator className="my-3 bg-border/50"/>
                            <h4 className="font-semibold text-lg mb-2 flex items-center radiant-text text-accent"><AlertTriangle className="w-5 h-5 mr-2 text-destructive"/>Potential Issues/Considerations:</h4>
                            <ul className="space-y-1 list-disc list-inside">
                                {response.potentialIssues.map((issue, index) => (
                                <li key={index} className="text-sm">{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">AI responses may not always be perfect. Always review and test code.</p>
                </CardFooter>
            </Card>
        </ScrollArea>
      )}
    </div>
  );
}
