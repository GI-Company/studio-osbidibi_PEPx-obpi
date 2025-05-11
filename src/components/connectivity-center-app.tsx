
"use client";

import type * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { ScreenShare, Wifi, Bluetooth, Nfc, Share2, Network, HardDrive, Router, Loader2 } from 'lucide-react';

const generateVirtualIp = () => `10.0.5.${Math.floor(Math.random() * 254) + 1}`;
const externalStorageOptions = ["None Detected", "USB Drive (Conceptual)", "SD Card (Conceptual)"];

export function ConnectivityCenterApp() {
  const [isScanningDisplays, setIsScanningDisplays] = useState(false);
  const [discoveredDisplays, setDiscoveredDisplays] = useState<string[]>([]);
  const [selectedDisplay, setSelectedDisplay] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);

  const [isWifiOn, setIsWifiOn] = useState(true);
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);
  const [isNfcOn, setIsNfcOn] = useState(false);

  const [virtualIp, setVirtualIp] = useState('');
  const [externalStorageStatus, setExternalStorageStatus] = useState('');

  useEffect(() => {
    setVirtualIp(generateVirtualIp());
    setExternalStorageStatus(externalStorageOptions[Math.floor(Math.random() * externalStorageOptions.length)]);
  }, []);

  const handleScanDisplays = () => {
    setIsScanningDisplays(true);
    setDiscoveredDisplays([]);
    setSelectedDisplay(null);
    toast({ title: "Scanning for Displays", description: "Searching for compatible displays on the virtual network..." });
    setTimeout(() => {
      const displays = Math.random() > 0.3 ? ["Conceptual Smart TV", "Virtual Monitor Alpha", "Projector X"] : [];
      setDiscoveredDisplays(displays.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * (displays.length + 1)) ));
      setIsScanningDisplays(false);
      if (displays.length === 0) {
        toast({ title: "Scan Complete", description: "No compatible displays found.", variant: "default" });
      } else {
        toast({ title: "Scan Complete", description: `${displays.length} display(s) found.` });
      }
    }, 2500);
  };

  const handleCastToDisplay = () => {
    if (!selectedDisplay) return;
    setIsCasting(true);
    toast({ title: "Casting Initialized", description: `Attempting to cast to ${selectedDisplay}... (Conceptual)` });
    setTimeout(() => {
      setIsCasting(false);
      toast({ title: "Casting Active", description: `Now casting to ${selectedDisplay}. (Conceptual)` });
    }, 2000);
  };

  const handleShareAction = () => {
    toast({ title: "Device Sharing", description: "Opening conceptual AirDrop/Nearby Share panel..." });
  };
  
  const handleToggleWifi = (checked: boolean) => {
    setIsWifiOn(checked);
    toast({ title: `Wi-Fi ${checked ? 'Enabled' : 'Disabled'}`, description: `Virtual Wi-Fi adapter is now ${checked ? 'active' : 'inactive'}.`});
  }

  const handleToggleBluetooth = (checked: boolean) => {
    setIsBluetoothOn(checked);
    toast({ title: `Bluetooth ${checked ? 'Enabled' : 'Disabled'}`, description: `Virtual Bluetooth adapter is now ${checked ? 'active' : 'inactive'}.`});
  }

  const handleToggleNfc = (checked: boolean) => {
    setIsNfcOn(checked);
    toast({ title: `NFC ${checked ? 'Enabled' : 'Disabled'}`, description: `Conceptual NFC module is now ${checked ? 'active' : 'inactive'}.`});
  }


  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-auto">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <Router className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">Connectivity Center</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Manage virtual network, display casting, and device connections.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-2 space-y-6">
        
        {/* Display Casting Section */}
        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><ScreenShare className="w-5 h-5 mr-2" />Display Casting</h4>
          <div className="space-y-3 p-3 rounded-md glassmorphic !bg-background/30">
            <Button onClick={handleScanDisplays} disabled={isScanningDisplays || isCasting} className="w-full sm:w-auto button-3d-interactive">
              {isScanningDisplays ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Scan for Displays
            </Button>
            {discoveredDisplays.length > 0 && !isScanningDisplays && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground radiant-text">Nearby Displays:</p>
                <ul className="max-h-32 overflow-y-auto space-y-1">
                  {discoveredDisplays.map(display => (
                    <li key={display}>
                      <Button 
                        variant={selectedDisplay === display ? "default" : "outline"} 
                        size="sm"
                        className={`w-full justify-start text-left button-3d-interactive ${selectedDisplay === display ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => setSelectedDisplay(display)}
                        disabled={isCasting}
                      >
                        {display}
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button onClick={handleCastToDisplay} disabled={!selectedDisplay || isCasting || isScanningDisplays} className="w-full sm:w-auto button-3d-interactive">
                  {isCasting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Cast to {selectedDisplay ? selectedDisplay.split(' ')[0] : 'Selected'}
                </Button>
              </div>
            )}
            {discoveredDisplays.length === 0 && !isScanningDisplays && (
                 <p className="text-sm text-muted-foreground radiant-text">No displays detected on the virtual network.</p>
            )}
          </div>
        </section>

        <Separator className="bg-border/50"/>

        {/* Wireless Radios Section */}
        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><Wifi className="w-5 h-5 mr-2" />Wireless Radios</h4>
          <div className="space-y-4 p-3 rounded-md glassmorphic !bg-background/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="wifi-toggle" className="flex items-center radiant-text">
                <Wifi className={`w-4 h-4 mr-2 ${isWifiOn ? 'text-primary' : 'text-muted-foreground'}`} />
                Wi-Fi (Virtual Adapter)
              </Label>
              <Switch id="wifi-toggle" checked={isWifiOn} onCheckedChange={handleToggleWifi} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="bluetooth-toggle" className="flex items-center radiant-text">
                <Bluetooth className={`w-4 h-4 mr-2 ${isBluetoothOn ? 'text-primary' : 'text-muted-foreground'}`} />
                Bluetooth (Virtual Adapter)
              </Label>
              <Switch id="bluetooth-toggle" checked={isBluetoothOn} onCheckedChange={handleToggleBluetooth} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="nfc-toggle" className="flex items-center radiant-text">
                <Nfc className={`w-4 h-4 mr-2 ${isNfcOn ? 'text-primary' : 'text-muted-foreground'}`} />
                NFC (Conceptual Module)
              </Label>
              <Switch id="nfc-toggle" checked={isNfcOn} onCheckedChange={handleToggleNfc} />
            </div>
          </div>
        </section>

        <Separator className="bg-border/50"/>

        {/* Device Sharing Section */}
        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><Share2 className="w-5 h-5 mr-2" />Device Sharing</h4>
          <div className="p-3 rounded-md glassmorphic !bg-background/30">
            <Button onClick={handleShareAction} variant="outline" className="w-full sm:w-auto button-3d-interactive">
              AirDrop / Nearby Share (Conceptual)
            </Button>
             <p className="text-xs text-muted-foreground mt-2 radiant-text">Simulates initiating a device-to-device sharing process.</p>
          </div>
        </section>
        
        <Separator className="bg-border/50"/>

        {/* Network & Storage Status Section */}
        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><Network className="w-5 h-5 mr-2"/>Network & Storage Status</h4>
          <div className="space-y-2 p-3 rounded-md glassmorphic !bg-background/30 text-sm">
            <p className="radiant-text">
              <span className="font-medium text-muted-foreground">Virtual IP Address:</span> {virtualIp}
            </p>
            <p className="radiant-text">
              <span className="font-medium text-muted-foreground">External Storage:</span> {externalStorageStatus}
            </p>
          </div>
        </section>

      </CardContent>
      <div className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20">
        Connectivity features are conceptual and operate within the BinaryBlocksphere virtual environment.
      </div>
    </div>
  );
}
