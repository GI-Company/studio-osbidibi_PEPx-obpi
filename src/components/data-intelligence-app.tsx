
"use client";
import type * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { ShieldQuestion, Phone, Search, UserSearch, MailSearch, Loader2, AlertTriangle } from 'lucide-react'; // Changed PhoneFind to Phone

interface LookupResult {
  id: string;
  query: string;
  type: 'phone' | 'email' | 'name';
  matches: SimulatedMatch[];
  timestamp: string;
  sourceEngine?: string; // Conceptual
}

interface SimulatedMatch {
  value: string;
  confidence?: number; // 0-1
  details?: Record<string, string>; // e.g., { City: "...", State: "...", Age: "..." }
}

const generateDummyMatch = (query: string, type: 'phone' | 'email' | 'name'): SimulatedMatch[] => {
    const numResults = Math.floor(Math.random() * 6) + 1; // 1 to 6 results
    const results: SimulatedMatch[] = [];
    for (let i = 0; i < numResults; i++) {
        let value = "";
        let details: Record<string, string> = {};
        switch(type) {
            case 'phone':
                value = `+1 (555) ${Math.floor(Math.random()*900)+100}-${Math.floor(Math.random()*9000)+1000}`;
                details['Carrier'] = ['AT&T', 'Verizon', 'T-Mobile'][Math.floor(Math.random()*3)];
                details['Location'] = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL'][Math.floor(Math.random()*3)];
                break;
            case 'email':
                const domain = ['gmail.com', 'outlook.com', 'bbs-mail.net'][Math.floor(Math.random()*3)];
                const namePart = query.split('@')[0] || `user${Math.floor(Math.random()*1000)}`;
                value = `${namePart.substring(0, namePart.length - Math.floor(Math.random()*2))}${String.fromCharCode(97 + Math.floor(Math.random()*3)) /* add 1-2 char diff */}@${domain}`;
                details['Reputation'] = ['Good', 'Unknown', 'Suspicious'][Math.floor(Math.random()*3)];
                break;
            case 'name':
                const firstNames = ["John", "Jane", "Alex", "Chris", "Pat"];
                const lastNames = ["Doe", "Smith", "Garcia", "Miller", "Binary"];
                value = `${firstNames[Math.floor(Math.random()*firstNames.length)]} ${lastNames[Math.floor(Math.random()*lastNames.length)]}`;
                details['City'] = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random()*5)];
                details['State'] = ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random()*5)];
                details['Age'] = (Math.floor(Math.random()*50)+20).toString();
                details['Zip'] = (Math.floor(Math.random()*90000)+10000).toString();
                break;
        }
        results.push({
            value,
            confidence: Math.random() * 0.3 + 0.6, // 0.6 to 0.9
            details
        });
    }
    // Simulate some near matches based on query
    if (type === 'name' && query.length > 2) {
       results.push({ value: `${query} (Possible Alias)`, confidence: 0.5, details: { City: 'Unknown', State: 'N/A'} });
    }
    if (type === 'email' && query.includes('@')) {
       const [name, domain] = query.split('@');
       results.push({ value: `${name.substring(0, Math.max(1,name.length-1))}X@${domain}`, confidence: 0.45, details: { Reputation: 'Possible Typo'} });
    }

    return results.slice(0, 50); // Max 50 results
};


export function DataIntelligenceApp() {
  const [phoneQuery, setPhoneQuery] = useState('');
  const [emailQuery, setEmailQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [zipFilter, setZipFilter] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<LookupResult[]>([]);

  const handleSubmitLookup = async (type: 'phone' | 'email' | 'name') => {
    let currentQuery = '';
    switch (type) {
      case 'phone': currentQuery = phoneQuery; break;
      case 'email': currentQuery = emailQuery; break;
      case 'name': currentQuery = nameQuery; break;
    }

    if (!currentQuery.trim()) {
      toast({ title: "Query Empty", description: "Please enter a search term.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    // Simulate API call / scraping
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const newResult: LookupResult = {
      id: `res-${Date.now()}`,
      query: currentQuery,
      type,
      matches: generateDummyMatch(currentQuery, type),
      timestamp: new Date().toLocaleString(),
      sourceEngine: ['Google', 'Bing', 'DuckDuckGo', 'BBS Internal Index'][Math.floor(Math.random()*4)] + ' (Simulated)'
    };
    
    if (type === 'name') { // Conceptual filtering for name search
        if(ageFilter) newResult.matches = newResult.matches.filter(m => m.details?.Age === ageFilter);
        if(cityFilter) newResult.matches = newResult.matches.filter(m => m.details?.City?.toLowerCase().includes(cityFilter.toLowerCase()));
        // State and Zip filtering would be similar
    }

    setResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
    setIsLoading(false);
    toast({ title: "Lookup Complete", description: `${newResult.matches.length} potential matches found for ${currentQuery}.` });
  };

  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-hidden">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <ShieldQuestion className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">Data Intelligence Suite</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Conceptual tools for information retrieval. Results are simulated.
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="phone" className="flex-grow flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 glassmorphic mb-2">
          <TabsTrigger value="phone" className="button-3d-interactive"><Phone className="mr-1.5"/>Phone Lookup</TabsTrigger>
          <TabsTrigger value="email" className="button-3d-interactive"><MailSearch className="mr-1.5"/>Email Lookup</TabsTrigger>
          <TabsTrigger value="name" className="button-3d-interactive"><UserSearch className="mr-1.5"/>Name Lookup</TabsTrigger>
        </TabsList>

        <div className="flex-grow flex flex-col md:flex-row gap-4 overflow-hidden p-1">
          {/* Input Forms Area */}
          <div className="w-full md:w-1/3 lg:w-1/4 space-y-4 p-3 rounded-md glassmorphic !bg-background/30 overflow-y-auto">
            <TabsContent value="phone" className="mt-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitLookup('phone'); }} className="space-y-3">
                <Label htmlFor="phoneQuery" className="radiant-text">Phone Number</Label>
                <Input id="phoneQuery" value={phoneQuery} onChange={e => setPhoneQuery(e.target.value)} placeholder="e.g., +1-555-123-4567" className="bg-input/70 focus:bg-input"/>
                <Button type="submit" className="w-full button-3d-interactive" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Search className="mr-2"/>} Search Phone
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="email" className="mt-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitLookup('email'); }} className="space-y-3">
                <Label htmlFor="emailQuery" className="radiant-text">Email Address</Label>
                <Input id="emailQuery" type="email" value={emailQuery} onChange={e => setEmailQuery(e.target.value)} placeholder="e.g., user@example.com" className="bg-input/70 focus:bg-input"/>
                <Button type="submit" className="w-full button-3d-interactive" disabled={isLoading}>
                   {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Search className="mr-2"/>} Search Email
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="name" className="mt-0">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitLookup('name'); }} className="space-y-3">
                <Label htmlFor="nameQuery" className="radiant-text">Full Name</Label>
                <Input id="nameQuery" value={nameQuery} onChange={e => setNameQuery(e.target.value)} placeholder="e.g., John Doe" className="bg-input/70 focus:bg-input"/>
                <Label htmlFor="ageFilter" className="radiant-text text-xs">Age (Optional)</Label>
                <Input id="ageFilter" value={ageFilter} onChange={e => setAgeFilter(e.target.value)} placeholder="e.g., 35" className="bg-input/70 focus:bg-input text-sm h-8"/>
                <Label htmlFor="cityFilter" className="radiant-text text-xs">City (Optional)</Label>
                <Input id="cityFilter" value={cityFilter} onChange={e => setCityFilter(e.target.value)} placeholder="e.g., New York" className="bg-input/70 focus:bg-input text-sm h-8"/>
                {/* State and Zip filters could be added similarly */}
                <Button type="submit" className="w-full button-3d-interactive" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Search className="mr-2"/>} Search Name
                </Button>
              </form>
            </TabsContent>
             <Alert variant="destructive" className="mt-auto">
                <AlertTriangle className="w-4 h-4"/>
                <AlertTitle className="text-sm">Disclaimer</AlertTitle>
                <AlertDescription className="text-xs">
                    These tools are for conceptual demonstration only. All data is simulated. 
                    Real-world data scraping/lookup may have legal and ethical implications and often violates API terms of service.
                </AlertDescription>
            </Alert>
          </div>

          {/* Results Area */}
          <div className="flex-grow p-3 rounded-md glassmorphic !bg-background/30 overflow-y-auto">
            <h4 className="text-lg font-semibold mb-2 text-accent radiant-text">Lookup History & Results (Simulated)</h4>
            {results.length === 0 && !isLoading && (
              <p className="text-muted-foreground text-center py-8 radiant-text">No lookups performed yet or no results for the last query.</p>
            )}
            {isLoading && results.length === 0 && (
                 <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary"/>
                    <p className="ml-2 radiant-text">Performing lookup...</p>
                 </div>
            )}
            <ScrollArea className="h-full max-h-[calc(100vh-280px)] pr-2"> {/* Adjust max-h as needed */}
              {results.map(result => (
                <Card key={result.id} className="mb-3 bg-card/50 border-border/50">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-base radiant-text capitalize">{result.type} Lookup: <span className="text-primary">{result.query}</span></CardTitle>
                    <CardDescription className="text-xs radiant-text">
                      Performed: {result.timestamp} via {result.sourceEngine}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 py-2 text-xs">
                    {result.matches.length === 0 && <p className="text-muted-foreground">No matches found.</p>}
                    <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                      {result.matches.map((match, idx) => (
                        <li key={idx} className="p-1.5 bg-black/20 rounded">
                          <p className="font-medium text-foreground radiant-text">{match.value} <span className="text-muted-foreground text-[10px]">(Confidence: {((match.confidence || 0) * 100).toFixed(0)}%)</span></p>
                          {match.details && Object.entries(match.details).map(([key, val]) => (
                            <p key={key} className="ml-2 text-muted-foreground/80 text-[10px] radiant-text">{key}: {val}</p>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </div>
        </div>
      </Tabs>

      <CardFooter className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20 mt-auto">
        Information retrieval tools operate on simulated data. Respect privacy and legal guidelines.
      </CardFooter>
    </div>
  );
}

