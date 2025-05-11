
"use client";

import type * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Video, Mic, Music, Loader2, AlertTriangle, PlayCircle, PauseCircle, SkipForward, SkipBack, Disc3, CameraOff, MicOff } from 'lucide-react';

export function MediaPlayerApp() {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  // const audioRef = useRef<HTMLAudioElement>(null); // For playing audio files, not for mic input directly

  const handleAgreeAndContinue = () => {
    if (agreementChecked) {
      setHasAgreed(true);
      setError(null);
    } else {
      toast({
        title: "Agreement Required",
        description: "You must agree to the terms and confirm your age to continue.",
        variant: "destructive",
      });
    }
  };

  const requestCamera = async () => {
    setIsLoadingPermissions(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast({ title: 'Camera Access Granted', description: 'Camera is now active.' });
    } catch (err) {
      console.error('Camera access denied:', err);
      setHasCameraPermission(false);
      setError('Camera access was denied. Please enable it in your browser settings.');
      toast({ title: 'Camera Access Denied', description: 'Please enable camera permission in your browser settings.', variant: 'destructive' });
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const requestMicrophone = async () => {
    setIsLoadingPermissions(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      // Conceptual: visualize or process microphone input stream
      // For now, we stop the tracks if not immediately used for recording to avoid continuous mic access indication.
      stream.getTracks().forEach(track => track.stop());
      toast({ title: 'Microphone Access Granted', description: 'Microphone is ready.' });
    } catch (err) {
      console.error('Microphone access denied:', err);
      setHasMicPermission(false);
      setError('Microphone access was denied. Please enable it in your browser settings.');
      toast({ title: 'Microphone Access Denied', description: 'Please enable microphone permission in your browser settings.', variant: 'destructive' });
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  useEffect(() => {
    // Cleanup function to stop media tracks when the component unmounts or permissions change
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      // If audio streams were kept active, they would be cleaned up here too
    };
  }, []);


  if (!hasAgreed) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-card text-card-foreground rounded-md">
        <Card className="w-full max-w-lg glassmorphic">
          <CardHeader>
            <CardTitle className="text-xl text-center radiant-text">Media Hub Access Agreement</CardTitle>
            <CardDescription className="text-center radiant-text">
              Please review and agree to the terms before using media features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-48 p-3 border rounded-md glassmorphic !bg-background/30">
              <h3 className="font-semibold text-accent radiant-text">Disclaimer & Terms of Service:</h3>
              <p className="text-xs mt-1 mb-2 radiant-text">
                The Media Hub provides access to your device's camera and microphone for multimedia functionalities within the BinaryBlocksphere environment. By proceeding, you acknowledge and agree to the following:
              </p>
              <ul className="space-y-1 text-xs list-disc list-inside radiant-text">
                <li>You are solely responsible for the content you create, record, or share using these features.</li>
                <li>BinaryBlocksphere and its operators are not responsible for any misuse of these features or any content generated.</li>
                <li>Permissions for camera and microphone access are handled by your browser and can be revoked at any time through browser settings.</li>
                <li>This is a conceptual environment. While permissions are real, data handling and storage are simulated or rely on browser capabilities. Do not share sensitive information.</li>
                <li>The "Music Player" functionality is a placeholder and does not currently play local files.</li>
              </ul>
              <h3 className="mt-3 font-semibold text-accent radiant-text">Age Restriction:</h3>
              <p className="text-xs mt-1 radiant-text">
                You must be 18 years of age or older to use the camera and microphone features of the Media Hub. By checking the box below, you confirm that you meet this age requirement.
              </p>
            </ScrollArea>
            <div className="flex items-center space-x-2 mt-3">
              <Checkbox id="agreement" checked={agreementChecked} onCheckedChange={(checked) => setAgreementChecked(checked as boolean)} />
              <Label htmlFor="agreement" className="text-sm font-normal radiant-text">
                I confirm I am 18 or older and I have read and agree to the Disclaimer and Terms of Service.
              </Label>
            </div>
            {error && <Alert variant="destructive"><AlertTriangle className="w-4 h-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          </CardContent>
          <CardHeader className="items-center">
             <Button onClick={handleAgreeAndContinue} className="w-full md:w-auto button-3d-interactive" disabled={!agreementChecked}>
              Agree and Continue
            </Button>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-1 md:p-2 bg-card text-card-foreground rounded-md overflow-hidden">
      <CardHeader className="px-0 py-3 text-center border-b border-primary/20">
        <div className="flex items-center justify-center">
            <Disc3 className="w-7 h-7 mr-2 text-primary"/>
            <CardTitle className="text-xl radiant-text">Multimedia Hub</CardTitle>
        </div>
         <CardDescription className="text-xs radiant-text">Access camera, microphone, and conceptual music player.</CardDescription>
      </CardHeader>

      {isLoadingPermissions && (
        <div className="flex items-center justify-center flex-grow">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 radiant-text">Requesting permissions...</p>
        </div>
      )}

      {!isLoadingPermissions && (hasCameraPermission === null || hasMicPermission === null) && (hasCameraPermission !== true || hasMicPermission !== true) && (
        <CardContent className="flex-grow flex flex-col items-center justify-center space-y-4 p-4">
            <Alert variant="default" className="glassmorphic !bg-background/30">
                <AlertTriangle className="w-5 h-5 text-accent"/>
                <AlertTitle className="radiant-text text-accent">Permissions Required</AlertTitle>
                <AlertDescription className="radiant-text">
                    This application needs access to your camera and microphone to function fully. Please grant permissions below.
                    {error && <p className="mt-2 text-destructive">{error}</p>}
                </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3">
                {hasCameraPermission !== true && (
                    <Button onClick={requestCamera} variant="outline" className="button-3d-interactive">
                        <Video className="w-4 h-4 mr-2" /> Grant Camera Access
                    </Button>
                )}
                {hasMicPermission !== true && (
                    <Button onClick={requestMicrophone} variant="outline" className="button-3d-interactive">
                        <Mic className="w-4 h-4 mr-2" /> Grant Microphone Access
                    </Button>
                )}
            </div>
             <p className="text-xs text-muted-foreground radiant-text">You can manage permissions in your browser settings at any time.</p>
        </CardContent>
      )}
      
      {(!isLoadingPermissions && (hasCameraPermission === true || hasMicPermission === true)) && (
        <Tabs defaultValue="camera" className="flex-grow flex flex-col w-full h-full overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 m-1 bg-muted/50 glassmorphic">
            <TabsTrigger value="camera" className="button-3d-interactive"><Video className="w-4 h-4 mr-1 sm:mr-2"/>Camera</TabsTrigger>
            <TabsTrigger value="microphone" className="button-3d-interactive"><Mic className="w-4 h-4 mr-1 sm:mr-2"/>Microphone</TabsTrigger>
            <TabsTrigger value="music" className="button-3d-interactive"><Music className="w-4 h-4 mr-1 sm:mr-2"/>Music Player</TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="flex-grow overflow-auto p-1 m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="flex flex-col items-center justify-center flex-grow p-2 rounded-md glassmorphic !bg-background/30">
              {hasCameraPermission === true ? (
                <>
                  <video ref={videoRef} className="w-full max-w-md aspect-video rounded-md bg-black border border-primary/30 shadow-lg" autoPlay muted playsInline />
                  <Button variant="outline" className="mt-3 button-3d-interactive" onClick={() => toast({title: "Record Action", description:"Conceptual video recording started/stopped."})}>
                    <PlayCircle className="w-4 h-4 mr-2"/> Conceptual Record
                  </Button>
                </>
              ) : (
                <Alert variant="destructive" className="w-full max-w-md">
                  <CameraOff className="w-5 h-5" />
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>
                    Camera permission is required for this feature. Please grant access.
                     {!isLoadingPermissions && <Button onClick={requestCamera} variant="link" className="p-0 h-auto text-xs mt-1">Try Granting Access Again</Button>}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="microphone" className="flex-grow overflow-auto p-1 m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="flex flex-col items-center justify-center flex-grow p-2 rounded-md glassmorphic !bg-background/30">
              {hasMicPermission === true ? (
                <div className="text-center">
                  <Mic className="w-16 h-16 text-primary mx-auto mb-3 animate-pulse" />
                  <p className="radiant-text text-lg">Microphone is Active</p>
                  <p className="text-sm text-muted-foreground radiant-text">Conceptual audio input would be visualized or processed here.</p>
                  <Button variant="outline" className="mt-4 button-3d-interactive" onClick={() => toast({title: "Record Action", description:"Conceptual audio recording started/stopped."})}>
                    <PlayCircle className="w-4 h-4 mr-2"/> Conceptual Record Audio
                  </Button>
                </div>
              ) : (
                <Alert variant="destructive" className="w-full max-w-md">
                  <MicOff className="w-5 h-5" />
                  <AlertTitle>Microphone Access Denied</AlertTitle>
                  <AlertDescription>
                    Microphone permission is required for this feature. Please grant access.
                    {!isLoadingPermissions && <Button onClick={requestMicrophone} variant="link" className="p-0 h-auto text-xs mt-1">Try Granting Access Again</Button>}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="music" className="flex-grow overflow-auto p-1 m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <div className="flex flex-col items-center justify-center flex-grow p-2 rounded-md glassmorphic !bg-background/30 text-center">
              <Music className="w-16 h-16 text-primary mx-auto mb-3 opacity-70" />
              <p className="radiant-text text-lg">Conceptual Music Player</p>
              <p className="text-sm text-muted-foreground radiant-text max-w-sm">
                This section is a placeholder for a JS media player. Controls for playback, playlist management, and file loading would appear here.
              </p>
              <div className="flex items-center space-x-3 mt-4">
                <Button variant="ghost" size="icon" className="button-3d-interactive" onClick={() => toast({title: "Playback Control", description:"Skip back (conceptual)."})}> <SkipBack className="w-5 h-5"/> </Button>
                <Button variant="default" size="icon" className="w-12 h-12 button-3d-interactive" onClick={() => toast({title: "Playback Control", description:"Play/Pause (conceptual)."})}> <PlayCircle className="w-7 h-7"/> </Button>
                <Button variant="ghost" size="icon" className="button-3d-interactive" onClick={() => toast({title: "Playback Control", description:"Skip forward (conceptual)."})}> <SkipForward className="w-5 h-5"/> </Button>
              </div>
              <Button variant="outline" className="mt-6 button-3d-interactive" onClick={() => toast({title: "File Action", description:"Open file dialog (conceptual)."})}>
                Load Media (Conceptual)
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
      <div className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20 mt-auto">
        Media Hub interactions are conceptual. Ensure you have appropriate permissions and understand the terms.
      </div>
    </div>
  );
}
