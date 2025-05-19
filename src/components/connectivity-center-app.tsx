
"use client";

import type * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  ScreenShare, Wifi, Bluetooth, Nfc, Share2, Network, HardDrive, Router, Loader2, Usb, 
  SignalHigh, SignalMedium, SignalLow, Lock, Unlock, Link, Unlink, CheckCircle, XCircle, ScanLine, WifiOff
} from 'lucide-react';
import { useVFS } from '@/contexts/VFSContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const generateVirtualIp = () => `10.0.5.${Math.floor(Math.random() * 254) + 1}`;
const VIRTUAL_EXTERNAL_DRIVE_PATH = '/mnt/external_usb_drive';

interface WifiNetwork {
  ssid: string;
  signal: 'high' | 'medium' | 'low';
  security: 'WPA2' | 'WEP' | 'Open';
  bssid: string; // MAC address
}

interface BluetoothDevice {
  id: string;
  name: string;
  type: 'headset' | 'mouse' | 'keyboard' | 'phone' | 'unknown';
  paired: boolean;
}

interface NfcTag {
    id: string;
    type: 'ndef' | 'felica' | 'iso-dep';
    data: string; // Simulated NDEF message or raw data
}


export function ConnectivityCenterApp() {
  const { getItem: getVFSItem, createFolder: createVFSFolder, deleteItem: deleteVFSItem } = useVFS();
  
  // Display Casting State
  const [isScanningDisplays, setIsScanningDisplays] = useState(false);
  const [discoveredDisplays, setDiscoveredDisplays] = useState<string[]>([]);
  const [selectedDisplay, setSelectedDisplay] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);

  // Wireless Radios State
  const [isWifiOn, setIsWifiOn] = useState(true);
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);
  const [isNfcOn, setIsNfcOn] = useState(false);
  
  // Wi-Fi Specific State
  const [scannedWifiNetworks, setScannedWifiNetworks] = useState<WifiNetwork[]>([]);
  const [isScanningWifi, setIsScanningWifi] = useState(false);
  const [selectedWifi, setSelectedWifi] = useState<WifiNetwork | null>(null);
  const [wifiPassword, setWifiPassword] = useState('');
  const [isConnectingToWifi, setIsConnectingToWifi] = useState(false);
  const [connectedWifiSsid, setConnectedWifiSsid] = useState<string | null>(null);

  // Bluetooth Specific State
  const [scannedBluetoothDevices, setScannedBluetoothDevices] = useState<BluetoothDevice[]>([]);
  const [isScanningBluetooth, setIsScanningBluetooth] = useState(false);
  const [isPairingBluetooth, setIsPairingBluetooth] = useState<string | null>(null); // Store ID of device being paired

  // NFC Specific State
  const [isScanningNfc, setIsScanningNfc] = useState(false);
  const [detectedNfcTag, setDetectedNfcTag] = useState<NfcTag | null>(null);

  // General Network State
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
      if (deleteVFSItem(VIRTUAL_EXTERNAL_DRIVE_PATH)) {
        setIsExternalDriveMounted(false);
        setExternalStorageStatus('No External Storage Detected');
        toast({ title: "Storage Unmounted", description: "BBS Virtual USB Drive disconnected from VFS." });
      } else {
        toast({ title: "Error", description: "Failed to unmount virtual drive. It might not exist or is protected.", variant: "destructive" });
      }
    } else {
      if (!getVFSItem('/mnt')) { // Check if /mnt exists
        const mntCreated = createVFSFolder('/', 'mnt'); // Create /mnt if it doesn't exist
        if (!mntCreated) {
            toast({ title: "Error", description: "Failed to create /mnt directory. Cannot mount virtual drive.", variant: "destructive"});
            return;
        }
      }
      if (createVFSFolder('/mnt', 'external_usb_drive')) {
        setIsExternalDriveMounted(true);
        setExternalStorageStatus('BBS Virtual USB Drive (Connected)');
        toast({ title: "Storage Mounted", description: `BBS Virtual USB Drive connected to VFS at ${VIRTUAL_EXTERNAL_DRIVE_PATH}.` });
      } else {
        // Check if already exists, which can happen if state is out of sync with VFS
        if (getVFSItem(VIRTUAL_EXTERNAL_DRIVE_PATH)) {
             setIsExternalDriveMounted(true);
             setExternalStorageStatus('BBS Virtual USB Drive (Connected)');
             toast({ title: "Info", description: "Virtual drive was already mounted in VFS.", variant: "default"});
        } else {
            toast({ title: "Error", description: "Failed to mount virtual drive. Ensure /mnt exists or the path is not occupied.", variant: "destructive" });
        }
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
      toast({ title: "Display Scan Complete", description: `${displays.length} BBS display(s) found.` });
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

  const handleToggleWifiRadio = (checked: boolean) => {
    setIsWifiOn(checked);
    if (!checked) { // If turning Wi-Fi off
        setConnectedWifiSsid(null);
        setSelectedWifi(null);
        setScannedWifiNetworks([]);
        toast({ title: `BBS Wi-Fi Disabled`, description: `BBS Virtual Wi-Fi adapter is now inactive. Disconnected from any network.`});
    } else {
        toast({ title: `BBS Wi-Fi Enabled`, description: `BBS Virtual Wi-Fi adapter is now active.`});
    }
  };
  
  const handleScanWifiNetworks = () => {
    if (!isWifiOn) {
      toast({ title: "Wi-Fi Disabled", description: "Please enable the BBS Wi-Fi adapter first.", variant: "destructive" });
      return;
    }
    setIsScanningWifi(true);
    setScannedWifiNetworks([]);
    setSelectedWifi(null);
    toast({ title: "Scanning for Wi-Fi Networks...", description: "Searching for available BBS virtual Wi-Fi networks..." });
    setTimeout(() => {
      const numNetworks = Math.floor(Math.random() * 8) + 2; // 2-9 networks
      const networks: WifiNetwork[] = [];
      const commonSSIDs = ["BBS_HyperNet", "PEPx_Connect", "OSbidibi_Guest", "VirtualLink", "BinarySphere_WiFi", "CoreNet_Secure", "Public_Hyperspace", "UserNet_Alpha"];
      for (let i = 0; i < numNetworks; i++) {
        const signalRoll = Math.random();
        networks.push({
          ssid: commonSSIDs[Math.floor(Math.random() * commonSSIDs.length)] + `_${Math.floor(Math.random()*100)}`,
          signal: signalRoll > 0.7 ? 'high' : signalRoll > 0.3 ? 'medium' : 'low',
          security: Math.random() > 0.3 ? 'WPA2' : (Math.random() > 0.5 ? 'WEP' : 'Open'),
          bssid: `00:1A:2B:${Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase()}`
        });
      }
      setScannedWifiNetworks(networks);
      setIsScanningWifi(false);
      toast({ title: "Wi-Fi Scan Complete", description: `${networks.length} networks found.`});
    }, 3000);
  };

  const handleConnectToWifi = () => {
    if (!selectedWifi) {
      toast({ title: "No Network Selected", description: "Please select a Wi-Fi network to connect.", variant: "destructive" });
      return;
    }
    if (selectedWifi.security !== 'Open' && !wifiPassword.trim()) {
      toast({ title: "Password Required", description: `Password is required for ${selectedWifi.ssid}.`, variant: "destructive" });
      return;
    }

    setIsConnectingToWifi(true);
    toast({ title: `Connecting to ${selectedWifi.ssid}...`, description: "Attempting to establish connection..."});
    setTimeout(() => {
      // Simulate connection success/failure
      const success = Math.random() > 0.2; // 80% success rate
      setIsConnectingToWifi(false);
      if (success) {
        setConnectedWifiSsid(selectedWifi.ssid);
        setVirtualIp(generateVirtualIp()); // Get a new "IP"
        toast({ title: "Wi-Fi Connected", description: `Successfully connected to ${selectedWifi.ssid}. Virtual IP: ${virtualIp}`});
      } else {
        toast({ title: "Connection Failed", description: `Could not connect to ${selectedWifi.ssid}. Check password or try again.`, variant: "destructive"});
      }
      setWifiPassword(''); // Clear password field
    }, 2500);
  };
  
  const handleDisconnectWifi = () => {
    if (!connectedWifiSsid) return;
    const prevSsid = connectedWifiSsid;
    setConnectedWifiSsid(null);
    setSelectedWifi(null); // Clear selection too
    setVirtualIp(generateVirtualIp()); // Reset IP or get a default "disconnected" IP
    toast({ title: "Wi-Fi Disconnected", description: `Disconnected from ${prevSsid}.`});
  };


  const handleToggleBluetoothRadio = (checked: boolean) => {
    setIsBluetoothOn(checked);
    if (!checked) {
        setScannedBluetoothDevices([]);
        // Disconnect any paired devices conceptually
        scannedBluetoothDevices.forEach(d => d.paired = false);
        toast({ title: `BBS Bluetooth Disabled`, description: `BBS Virtual Bluetooth adapter is now inactive.`});
    } else {
        toast({ title: `BBS Bluetooth Enabled`, description: `BBS Virtual Bluetooth adapter is now active.`});
    }
  };

  const handleScanBluetoothDevices = () => {
    if (!isBluetoothOn) {
      toast({ title: "Bluetooth Disabled", description: "Please enable the BBS Bluetooth adapter first.", variant: "destructive" });
      return;
    }
    setIsScanningBluetooth(true);
    setScannedBluetoothDevices([]);
    toast({ title: "Scanning for Bluetooth Devices...", description: "Searching for nearby BBS compatible devices..." });
    setTimeout(() => {
      const numDevices = Math.floor(Math.random() * 5) + 1;
      const devices: BluetoothDevice[] = [];
      const deviceNames = ["BBS Headset Alpha", "Quantum Mouse", "PEPx Keyboard", "User-Device-Gamma", "BBS_BT_Speaker"];
      const deviceTypes: BluetoothDevice['type'][] = ['headset', 'mouse', 'keyboard', 'phone', 'unknown'];
      for (let i = 0; i < numDevices; i++) {
        devices.push({
          id: `bt-${Date.now()}-${i}`,
          name: deviceNames[Math.floor(Math.random() * deviceNames.length)],
          type: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
          paired: false
        });
      }
      setScannedBluetoothDevices(devices);
      setIsScanningBluetooth(false);
      toast({ title: "Bluetooth Scan Complete", description: `${devices.length} devices found.`});
    }, 2500);
  };
  
  const handlePairBluetoothDevice = (deviceId: string) => {
    setIsPairingBluetooth(deviceId);
    toast({ title: "Pairing Bluetooth Device...", description: `Attempting to pair with device...`});
    setTimeout(() => {
        setScannedBluetoothDevices(prev => prev.map(d => d.id === deviceId ? {...d, paired: true} : d));
        setIsPairingBluetooth(null);
        toast({ title: "Bluetooth Device Paired", description: `Successfully paired with selected device.`});
    }, 2000);
  };
  
  const handleUnpairBluetoothDevice = (deviceId: string) => {
     setScannedBluetoothDevices(prev => prev.map(d => d.id === deviceId ? {...d, paired: false} : d));
     toast({ title: "Bluetooth Device Unpaired", description: `Device has been unpaired.`});
  };

  const handleToggleNfcRadio = (checked: boolean) => {
    setIsNfcOn(checked);
    if (!checked) {
        setDetectedNfcTag(null);
        toast({ title: `BBS NFC Disabled`, description: `BBS Virtual NFC module is now inactive.`});
    } else {
        toast({ title: `BBS NFC Enabled`, description: `BBS Virtual NFC module is now active. Hold tag near conceptual reader.`});
    }
  };
  
  const handleScanNfcTag = () => {
    if (!isNfcOn) {
      toast({ title: "NFC Disabled", description: "Please enable the BBS NFC module first.", variant: "destructive" });
      return;
    }
    setIsScanningNfc(true);
    setDetectedNfcTag(null);
    toast({ title: "Scanning for NFC Tag...", description: "Hold NFC tag near the conceptual BBS reader..." });
    setTimeout(() => {
        const found = Math.random() > 0.4;
        if(found) {
            const tagTypes: NfcTag['type'][] = ['ndef', 'felica', 'iso-dep'];
            const tag: NfcTag = {
                id: `nfc-${Date.now()}`,
                type: tagTypes[Math.floor(Math.random() * tagTypes.length)],
                data: `BBS_DATA_PAYLOAD:{id: ${Math.random().toString(36).substring(2)}, ts: ${Date.now()}}`
            };
            setDetectedNfcTag(tag);
            toast({ title: "NFC Tag Detected", description: `Tag Type: ${tag.type}. Data retrieved.`});
        } else {
            toast({ title: "NFC Scan Failed", description: "No NFC tag detected or read error.", variant: "destructive"});
        }
        setIsScanningNfc(false);
    }, 3000);
  };


  const handleShareAction = () => {
    toast({ title: "BBS PeerLink", description: "Opening BBS PeerLink panel for secure data exchange... (Conceptual - No AirDrop/Nearby Share)" });
  };
  
  const getSignalIcon = (signal: WifiNetwork['signal']) => {
    if (signal === 'high') return <SignalHigh className="w-4 h-4 text-green-400"/>;
    if (signal === 'medium') return <SignalMedium className="w-4 h-4 text-yellow-400"/>;
    return <SignalLow className="w-4 h-4 text-red-400"/>;
  };


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
        
        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><ScreenShare className="w-5 h-5 mr-2" />BBS Display Casting</h4>
          <div className="space-y-3 p-3 rounded-md glassmorphic !bg-background/30">
            <Button onClick={handleScanDisplays} disabled={isScanningDisplays || isCasting} className="w-full sm:w-auto button-3d-interactive">
              {isScanningDisplays ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Scan for BBS Displays
            </Button>
            {discoveredDisplays.length > 0 && !isScanningDisplays && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground radiant-text">Nearby BBS Displays:</Label>
                <ul className="max-h-32 overflow-y-auto space-y-1">
                  {discoveredDisplays.map(display => (
                    <li key={display}>
                      <Button variant={selectedDisplay === display ? "default" : "outline"} size="sm" className={`w-full justify-start text-left button-3d-interactive ${selectedDisplay === display ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setSelectedDisplay(display)} disabled={isCasting}> {display} </Button>
                    </li>
                  ))}
                </ul>
                <Button onClick={handleCastToDisplay} disabled={!selectedDisplay || isCasting || isScanningDisplays} className="w-full sm:w-auto button-3d-interactive">
                  {isCasting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Cast GDE to {selectedDisplay ? selectedDisplay.split(' ')[0] : 'Selected'}
                </Button>
                 <p className="text-xs text-muted-foreground mt-1 radiant-text">Share GDE output to a BBS-managed virtual display.</p>
              </div>
            )}
            {discoveredDisplays.length === 0 && !isScanningDisplays && !isCasting && ( <p className="text-sm text-muted-foreground radiant-text">No BBS displays detected on the virtual network.</p> )}
          </div>
        </section>

        <Separator className="bg-border/50"/>

        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><Wifi className="w-5 h-5 mr-2" />BBS Wi-Fi Adapter</h4>
          <div className="space-y-4 p-3 rounded-md glassmorphic !bg-background/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="wifi-toggle" className="flex items-center radiant-text">
                <Wifi className={`w-4 h-4 mr-2 ${isWifiOn ? (connectedWifiSsid ? 'text-green-400' : 'text-primary') : 'text-muted-foreground'}`} />
                Virtual Wi-Fi Adapter
              </Label>
              <Switch id="wifi-toggle" checked={isWifiOn} onCheckedChange={handleToggleWifiRadio} />
            </div>
            {isWifiOn && (
              <>
                {connectedWifiSsid ? (
                  <div className="p-2 border border-green-500/50 rounded-md bg-green-500/10">
                    <p className="text-sm text-green-300 radiant-text">Connected to: <strong className="text-green-200">{connectedWifiSsid}</strong></p>
                    <p className="text-xs text-muted-foreground radiant-text">Virtual IP: {virtualIp}</p>
                    <Button onClick={handleDisconnectWifi} variant="destructive" size="sm" className="mt-2 button-3d-interactive"><WifiOff className="mr-1.5"/>Disconnect</Button>
                  </div>
                ) : (
                  <>
                    <Button onClick={handleScanWifiNetworks} disabled={isScanningWifi} className="w-full sm:w-auto button-3d-interactive">
                        {isScanningWifi ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ScanLine className="mr-1.5"/>} Scan for Wi-Fi Networks
                    </Button>
                    {scannedWifiNetworks.length > 0 && !isScanningWifi && (
                        <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground radiant-text">Available Networks:</Label>
                        <ScrollArea className="max-h-40">
                        <ul className="space-y-1 pr-2">
                            {scannedWifiNetworks.map(net => (
                            <li key={net.bssid}>
                                <Button variant={selectedWifi?.bssid === net.bssid ? "secondary" : "ghost"} className="w-full justify-between text-left h-auto py-1.5 px-2 button-3d-interactive" onClick={() => setSelectedWifi(net)}>
                                <span className="flex items-center"><span className="mr-1.5">{getSignalIcon(net.signal)}</span> {net.ssid}</span>
                                {net.security !== 'Open' && <Lock className="w-3.5 h-3.5 text-amber-400"/>}
                                </Button>
                            </li>
                            ))}
                        </ul>
                        </ScrollArea>
                        {selectedWifi && (
                            <div className="p-2 border border-primary/30 rounded-md space-y-2 bg-background/30">
                                <p className="text-sm radiant-text">Connect to: <strong className="text-primary">{selectedWifi.ssid}</strong></p>
                                {selectedWifi.security !== 'Open' && (
                                    <Input type="password" placeholder={`Password for ${selectedWifi.ssid}`} value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} className="bg-input/70 focus:bg-input"/>
                                )}
                                <Button onClick={handleConnectToWifi} disabled={isConnectingToWifi} className="button-3d-interactive">
                                    {isConnectingToWifi ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link className="mr-1.5"/>} Connect
                                </Button>
                            </div>
                        )}
                        </div>
                    )}
                    {scannedWifiNetworks.length === 0 && !isScanningWifi && <p className="text-sm text-muted-foreground radiant-text">No Wi-Fi networks found or scan not performed.</p>}
                  </>
                )}
              </>
            )}
          </div>
        </section>
        
        <Separator className="bg-border/50"/>

        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><Bluetooth className="w-5 h-5 mr-2" />BBS Bluetooth Adapter</h4>
          <div className="space-y-4 p-3 rounded-md glassmorphic !bg-background/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="bluetooth-toggle" className="flex items-center radiant-text">
                <Bluetooth className={`w-4 h-4 mr-2 ${isBluetoothOn ? 'text-primary' : 'text-muted-foreground'}`} />
                Virtual Bluetooth Adapter
              </Label>
              <Switch id="bluetooth-toggle" checked={isBluetoothOn} onCheckedChange={handleToggleBluetoothRadio} />
            </div>
            {isBluetoothOn && (
              <>
                <Button onClick={handleScanBluetoothDevices} disabled={isScanningBluetooth} className="w-full sm:w-auto button-3d-interactive">
                    {isScanningBluetooth ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ScanLine className="mr-1.5"/>} Scan for Bluetooth Devices
                </Button>
                {scannedBluetoothDevices.length > 0 && !isScanningBluetooth && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground radiant-text">Discovered Devices:</Label>
                    <ScrollArea className="max-h-40">
                    <ul className="space-y-1 pr-2">
                        {scannedBluetoothDevices.map(dev => (
                        <li key={dev.id} className="flex items-center justify-between p-1.5 rounded hover:bg-primary/10">
                            <span className="text-sm radiant-text">{dev.name} <span className="text-xs text-muted-foreground">({dev.type})</span></span>
                            {dev.paired ? (
                                <Button onClick={() => handleUnpairBluetoothDevice(dev.id)} variant="destructive" size="sm" className="button-3d-interactive"><Unlink className="mr-1.5"/>Unpair</Button>
                            ) : (
                                <Button onClick={() => handlePairBluetoothDevice(dev.id)} variant="outline" size="sm" className="button-3d-interactive" disabled={!!isPairingBluetooth}>
                                    {isPairingBluetooth === dev.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Link className="mr-1.5"/>} Pair
                                </Button>
                            )}
                        </li>
                        ))}
                    </ul>
                    </ScrollArea>
                  </div>
                )}
                 {scannedBluetoothDevices.length === 0 && !isScanningBluetooth && <p className="text-sm text-muted-foreground radiant-text">No Bluetooth devices found or scan not performed.</p>}
              </>
            )}
          </div>
        </section>
        
        <Separator className="bg-border/50"/>
        
        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><Nfc className="w-5 h-5 mr-2" />BBS NFC Module</h4>
          <div className="space-y-4 p-3 rounded-md glassmorphic !bg-background/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="nfc-toggle" className="flex items-center radiant-text">
                <Nfc className={`w-4 h-4 mr-2 ${isNfcOn ? 'text-primary' : 'text-muted-foreground'}`} />
                Virtual NFC Module
              </Label>
              <Switch id="nfc-toggle" checked={isNfcOn} onCheckedChange={handleToggleNfcRadio} />
            </div>
             {isNfcOn && (
              <>
                <Button onClick={handleScanNfcTag} disabled={isScanningNfc} className="w-full sm:w-auto button-3d-interactive">
                    {isScanningNfc ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ScanLine className="mr-1.5"/>} Scan for NFC Tag
                </Button>
                {detectedNfcTag && !isScanningNfc && (
                    <div className="p-2 border border-primary/30 rounded-md bg-background/30 text-xs">
                        <p className="radiant-text text-primary">Tag Detected!</p>
                        <p className="radiant-text">ID: {detectedNfcTag.id}</p>
                        <p className="radiant-text">Type: {detectedNfcTag.type}</p>
                        <p className="radiant-text break-all">Data: {detectedNfcTag.data}</p>
                    </div>
                )}
                {!detectedNfcTag && !isScanningNfc && <p className="text-sm text-muted-foreground radiant-text">No NFC tag detected or scan not performed.</p>}
              </>
            )}
          </div>
        </section>


        <Separator className="bg-border/50"/>

        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><Share2 className="w-5 h-5 mr-2" />BBS PeerLink</h4>
          <div className="p-3 rounded-md glassmorphic !bg-background/30">
            <Button onClick={handleShareAction} variant="outline" className="w-full sm:w-auto button-3d-interactive">
              Activate BBS PeerLink
            </Button>
             <p className="text-xs text-muted-foreground mt-2 radiant-text">Conceptual BBS PeerLink for secure data exchange. (No actual AirDrop/Nearby Share)</p>
          </div>
        </section>
        
        <Separator className="bg-border/50"/>

        <section>
          <h4 className="text-lg font-semibold mb-3 flex items-center radiant-text text-accent"><Network className="w-5 h-5 mr-2"/>BBS Network & Storage Status</h4>
          <div className="space-y-3 p-3 rounded-md glassmorphic !bg-background/30 text-sm">
            <p className="radiant-text">
              <span className="font-medium text-muted-foreground">Current BBS Virtual IP:</span> {virtualIp}
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
        BBS Connectivity features operate within its virtualized environment and use simulated hardware access.
      </div>
    </div>
  );
}

