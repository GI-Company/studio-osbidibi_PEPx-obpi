
"use client";

import type * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { ScreenShare, Wifi, Bluetooth, Nfc, Share2, Network, HardDrive, Router, Loader2, Usb } from 'lucide-react';
import { useVFS } from '@/contexts/VFSContext'; // Import useVFS

const generateVirtualIp = () => `10.0.5.${Math.floor(Math.random() * 254) + 1}`;
const VIRTUAL_EXTERNAL_DRIVE_PATH = '/mnt/external_usb_drive';

export function ConnectivityCenterApp() {
  const { getItem: getVFSItem, createFolder: createVFSFolder, deleteItem: deleteVFSItem } = useVFS();
  const [isScanningDisplays, setIsScanningDisplays] = useState(false);
  const [discoveredDisplays, setDiscoveredDisplays] = useState<string[]>([]);
  const [selectedDisplay, setSelectedDisplay] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);

  const [isWifiOn, setIsWifiOn] = useState(true);
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);
  const [isNfcOn, setIsNfcOn] = useState(false);

  const [virtualIp, setVirtualIp] = useState('');
  const [externalStorageStatus, setExternalStorageStatus] = useState('No External Storage Detected');
  const [isExternalDriveMounted, setIsExternalDriveMounted] = useState(false);


  useEffect(() => {
    setVirtualIp(generateVirtualIp());
    const driveItem = getVFSItem(VIRTUAL_EXTERNAL_DRIVE_PATH);
    setIsExternalDriveMounted(!!driveItem);
    setExternalStorageStatus(driveItem ? 'BBS Virtual USB Drive (Connected)' : 'No External Storage Detected');
  }, [getVFSItem]);

  const handleToggleExternalStorage = () => {
    if (isExternalDriveMounted) {
      // Unmount
      if (deleteVFSItem(VIRTUAL_EXTERNAL_DRIVE_PATH)) {
        setIsExternalDriveMounted(false);
        setExternalStorageStatus('No External Storage Detected');
        toast({ title: "Storage Unmounted", description: "BBS Virtual USB Drive disconnected from VFS." });
      } else {
        toast({ title: "Error", description: "Failed to unmount virtual drive.", variant: "destructive" });
      }
    } else {
      // Mount
      if (createVFSFolder('/mnt', 'external_usb_drive')) { // Ensure /mnt exists or create it
        setIsExternalDriveMounted(true);
        setExternalStorageStatus('BBS Virtual USB Drive (Connected)');
        toast({ title: "Storage Mounted", description: "BBS Virtual USB Drive connected to VFS at /mnt/external_usb_drive." });
      } else {
         // Check if /mnt itself needs to be created first
         if(!getVFSItem('/mnt')){
            createVFSFolder('/', 'mnt'); // create /mnt first
            if(createVFSFolder('/mnt', 'external_usb_drive')){ // then try again
                setIsExternalDriveMounted(true);
                setExternalStorageStatus('BBS Virtual USB Drive (Connected)');
                toast({ title: "Storage Mounted", description: "BBS Virtual USB Drive connected to VFS at /mnt/external_usb_drive." });
                return;
            }
         }
        toast({ title: "Error", description: "Failed to mount virtual drive. Ensure /mnt exists.", variant: "destructive" });
      }
    }
  };


  const handleScanDisplays = () => {
    setIsScanningDisplays(true);
    setDiscoveredDisplays([]);
    setSelectedDisplay(null);
    toast({ title: "Scanning for BBS Displays", description: "Searching for compatible displays on the BBS virtual network..." });
    setTimeout(() => {
      const displays = Math.random() > 0.3 ? ["BBS Virtual Display Alpha", "BBS Projection Unit X7", "GDE Miracast Receiver"] : [];
      setDiscoveredDisplays(displays.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * (displays.length + 1)) ));
      setIsScanningDisplays(false);
      if (displays.length === 0) {
        toast({ title: "Scan Complete", description: "No compatible BBS displays found.", variant: "default" });
      } else {
        toast({ title: "Scan Complete", description: `${displays.length} BBS display(s) found.` });
      }
    }, 2500);
  };

  const handleCastToDisplay = () => {
    if (!selectedDisplay) return;
    setIsCasting(true);
    toast({ title: "BBS Casting Initialized", description: `Attempting to cast GDE output to ${selectedDisplay}...` });
    setTimeout(() => {
      setIsCasting(false);
      toast({ title: "BBS Casting Active", description: `Now casting GDE output to ${selectedDisplay}.` });
    }, 2000);
  };

  const handleShareAction = () => {
    toast({ title: "BBS PeerLink", description: "Opening BBS PeerLink panel for secure data exchange..." });
  };
  
  const handleToggleWifi = (checked: boolean) => {
    setIsWifiOn(checked);
    toast({ title: `BBS Wi-Fi ${checked ? 'Enabled' : 'Disabled'}`, description: `BBS Virtual Wi-Fi adapter is now ${checked ? 'active' : 'inactive'}.`});
  }

  const handleToggleBluetooth = (checked: boolean) => {
    setIsBluetoothOn(checked);
    toast({ title: `BBS Bluetooth ${checked ? 'Enabled' : 'Disabled'}`, description: `BBS Virtual Bluetooth adapter is now ${checked ? 'active' : 'inactive'}.`});
  }

  const handleToggleNfc = (checked: boolean) => {
    setIsNfcOn(checked);
    toast({ title: `BBS NFC ${checked ? 'Enabled' : 'Disabled'}`, description: `BBS Virtual NFC module is now ${checked ? 'active' : 'inactive'}.`});
  }


  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-auto">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <Router className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">BBS Connectivity Center</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Manage BBS virtual network, display casting, and device connections.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-2 space-y-6">
        
        {/* Display Casting Section */}
        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><ScreenShare className="w-5 h-5 mr-2" />BBS Display Casting</h4>
          <div className="space-y-3 p-3 rounded-md glassmorphic !bg-background/30">
            <Button onClick={handleScanDisplays} disabled={isScanningDisplays || isCasting} className="w-full sm:w-auto button-3d-interactive">
              {isScanningDisplays ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Scan for BBS Displays
            </Button>
            {discoveredDisplays.length > 0 && !isScanningDisplays && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground radiant-text">Nearby BBS Displays:</p>
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
                  Cast GDE to {selectedDisplay ? selectedDisplay.split(' ')[0] : 'Selected'}
                </Button>
                 <p className="text-xs text-muted-foreground mt-1 radiant-text">Share GDE output to a BBS-managed virtual display.</p>
              </div>
            )}
            {discoveredDisplays.length === 0 && !isScanningDisplays && (
                 <p className="text-sm text-muted-foreground radiant-text">No BBS displays detected on the virtual network.</p>
            )}
          </div>
        </section>

        <Separator className="bg-border/50"/>

        {/* Wireless Radios Section */}
        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><Wifi className="w-5 h-5 mr-2" />BBS Wireless Radios</h4>
          <div className="space-y-4 p-3 rounded-md glassmorphic !bg-background/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="wifi-toggle" className="flex items-center radiant-text">
                <Wifi className={`w-4 h-4 mr-2 ${isWifiOn ? 'text-primary' : 'text-muted-foreground'}`} />
                Wi-Fi (BBS Virtual Adapter)
              </Label>
              <Switch id="wifi-toggle" checked={isWifiOn} onCheckedChange={handleToggleWifi} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="bluetooth-toggle" className="flex items-center radiant-text">
                <Bluetooth className={`w-4 h-4 mr-2 ${isBluetoothOn ? 'text-primary' : 'text-muted-foreground'}`} />
                Bluetooth (BBS Virtual Adapter)
              </Label>
              <Switch id="bluetooth-toggle" checked={isBluetoothOn} onCheckedChange={handleToggleBluetooth} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="nfc-toggle" className="flex items-center radiant-text">
                <Nfc className={`w-4 h-4 mr-2 ${isNfcOn ? 'text-primary' : 'text-muted-foreground'}`} />
                NFC (BBS Virtual Module)
              </Label>
              <Switch id="nfc-toggle" checked={isNfcOn} onCheckedChange={handleToggleNfc} />
            </div>
          </div>
        </section>

        <Separator className="bg-border/50"/>

        {/* Device Sharing Section */}
        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><Share2 className="w-5 h-5 mr-2" />BBS PeerLink</h4>
          <div className="p-3 rounded-md glassmorphic !bg-background/30">
            <Button onClick={handleShareAction} variant="outline" className="w-full sm:w-auto button-3d-interactive">
              Activate BBS PeerLink
            </Button>
             <p className="text-xs text-muted-foreground mt-2 radiant-text">Initiates BBS PeerLink for secure data exchange with other BBS instances.</p>
          </div>
        </section>
        
        <Separator className="bg-border/50"/>

        {/* Network & Storage Status Section */}
        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><Network className="w-5 h-5 mr-2"/>BBS Network & Storage Status</h4>
          <div className="space-y-3 p-3 rounded-md glassmorphic !bg-background/30 text-sm">
            <p className="radiant-text">
              <span className="font-medium text-muted-foreground">BBS Virtual IP:</span> {virtualIp}
            </p>
            <div className="flex items-center justify-between">
                <p className="radiant-text">
                <span className="font-medium text-muted-foreground">External VFS Storage:</span> {externalStorageStatus}
                </p>
                <Button onClick={handleToggleExternalStorage} variant="outline" size="sm" className="button-3d-interactive">
                    <Usb className="w-3.5 h-3.5 mr-1.5"/> {isExternalDriveMounted ? 'Disconnect' : 'Connect'} Virtual Drive
                </Button>
            </div>
          </div>
        </section>

      </CardContent>
      <div className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20">
        BBS Connectivity features operate within its virtualized environment.
      </div>
    </div>
  );
}
