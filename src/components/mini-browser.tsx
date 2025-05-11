"use client";

import type * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowRight, RotateCcw } from 'lucide-react';

const searchEngines = {
  google: "https://www.google.com/search?q=",
  duckduckgo: "https://duckduckgo.com/?q=",
  bing: "https://www.bing.com/search?q=",
};

type SearchEngineKey = keyof typeof searchEngines;

interface MiniBrowserProps {
  initialUrl?: string;
}

export function MiniBrowser({ initialUrl = "https://www.google.com/webhp?igu=1" }: MiniBrowserProps) {
  const [addressBarInput, setAddressBarInput] = useState(initialUrl);
  const [searchBarInput, setSearchBarInput] = useState("");
  const [selectedSearchEngine, setSelectedSearchEngine] = useState<SearchEngineKey>("google");
  const [iframeSrc, setIframeSrc] = useState(initialUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setAddressBarInput(initialUrl);
    setIframeSrc(initialUrl);
  }, [initialUrl]);

  const handleNavigate = () => {
    let urlToLoad = addressBarInput.trim();
    if (urlToLoad && !urlToLoad.startsWith('http://') && !urlToLoad.startsWith('https://')) {
      urlToLoad = 'https://' + urlToLoad;
    }
    setIframeSrc(urlToLoad);
  };

  const handleSearch = () => {
    if (!searchBarInput.trim()) return;
    const searchUrl = searchEngines[selectedSearchEngine] + encodeURIComponent(searchBarInput.trim());
    setIframeSrc(searchUrl);
    setAddressBarInput(searchUrl); 
  };
  
  const handleIframeLoad = () => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const currentLoc = iframeRef.current.contentWindow.location.href;
        // Avoid updating if it's about:blank or same as intended src due to sandbox redirects
        if (currentLoc !== 'about:blank' && currentLoc !== iframeSrc) {
           // Check if it is a common search engine redirect
           if (!Object.values(searchEngines).some(engineBase => currentLoc.startsWith(engineBase)) ) {
             setAddressBarInput(currentLoc);
           }
        }
      }
    } catch (error) {
      console.warn("Cannot access iframe location due to security restrictions:", error);
      // Potentially set address bar to a generic "navigation occurred" message
      // or keep it as the last known valid URL.
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc; // Re-assign src to force reload
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-card text-card-foreground overflow-hidden">
      <div className="p-2 border-b border-border bg-muted/50 space-y-2">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh page">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Input
            type="text"
            value={addressBarInput}
            onChange={(e) => setAddressBarInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
            placeholder="Enter URL and press Enter"
            className="flex-grow h-9 text-sm"
            aria-label="Address bar"
          />
          <Button onClick={handleNavigate} size="icon" className="h-9 w-9" aria-label="Go to address">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedSearchEngine} onValueChange={(value) => setSelectedSearchEngine(value as SearchEngineKey)}>
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <SelectValue placeholder="Search Engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
              <SelectItem value="bing">Bing</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="text"
            value={searchBarInput}
            onChange={(e) => setSearchBarInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search..."
            className="flex-grow h-9 text-sm"
            aria-label="Search input"
          />
          <Button onClick={handleSearch} size="icon" className="h-9 w-9" aria-label="Search">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className="flex-grow w-full h-full border-0"
        title="Mini Web Browser"
        sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation"
        referrerPolicy="no-referrer" // To prevent some sites from blocking iframe
        onLoad={handleIframeLoad}
        data-ai-hint="web content display"
      >
        Your browser does not support iframes.
      </iframe>
    </div>
  );
}

