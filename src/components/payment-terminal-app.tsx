
"use client";
import type * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { QrCode, Save, RefreshCw, Wallet, CheckCircle, XCircle, Apple, Smartphone, CreditCard, Info, ClipboardCopy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // For potential admin features

// Placeholder for QRCode.toCanvas if library is not available
const QRCode = {
  toCanvas: (canvasElement: HTMLCanvasElement, text: string, options: any, cb: (error?: Error) => void) => {
    if (canvasElement) {
      const ctx = canvasElement.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.fillStyle = options?.color?.light || '#FFFFFF';
        ctx.fillRect(0,0, canvasElement.width, canvasElement.height);
        ctx.fillStyle = options?.color?.dark || '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const fontSize = Math.min(canvasElement.width / (text.length || 1) * 1.5, 12);
        ctx.font = `${fontSize}px Arial`;
        // Simple text rendering as placeholder
        const lines = text.split('|').map(line => line.substring(0, 20)); // Max 20 chars per line for readability
        const lineHeight = fontSize * 1.2;
        const startY = (canvasElement.height - (lines.length -1) * lineHeight) / 2;

        lines.forEach((line, index) => {
          ctx.fillText(line, canvasElement.width / 2, startY + index * lineHeight);
        });
        
        // Draw a border to signify it's a QR code area
        ctx.strokeStyle = options?.color?.dark || '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(2,2, canvasElement.width-4, canvasElement.height-4);
        if (cb) cb();
        return;
      }
    }
    if (cb) cb(new Error("Canvas not available for QR Code placeholder."));
  }
};


// Card type configurations
const CARD_CONFIGS = {
  visa: { prefixes: ['4'], length: 16, icon: <CreditCard className="w-5 h-5 text-blue-600" /> },
  mastercard: { prefixes: ['51', '52', '53', '54', '55'], length: 16, icon: <CreditCard className="w-5 h-5 text-red-600" /> },
  amex: { prefixes: ['34', '37'], length: 15, icon: <CreditCard className="w-5 h-5 text-green-600" /> }
};

type CardType = keyof typeof CARD_CONFIGS;

// ISO 7813 Track formats
const TRACK_FORMATS = {
  track1: { startSentinel: '%', endSentinel: '?', fieldSeparator: '^' },
  track2: { startSentinel: ';', endSentinel: '?', fieldSeparator: '=' },
  track3: { startSentinel: '+', endSentinel: '?', fieldSeparator: '=' }
};

type WalletProviderKey = 'apple' | 'google' | 'samsung';
const WALLET_PROVIDERS: Record<WalletProviderKey, { name: string; icon: React.ReactNode; format: string }> = {
  apple: { name: 'Apple Wallet', icon: <Apple className="w-full h-full" />, format: 'pkpass' },
  google: { name: 'Google Pay', icon: <svg viewBox="0 0 24 24" className="w-full h-full fill-current"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>, format: 'json' },
  samsung: { name: 'Samsung Pay', icon: <Smartphone className="w-full h-full" />, format: 'json' }
};


export function PaymentTerminalApp() {
  const { currentUser } = useAuth(); // For potential admin functionalities
  const [cardType, setCardType] = useState<CardType>('visa');
  const [pan, setPan] = useState('');
  const [cardholderName, setCardholderName] = useState('DOE/JOHN');
  const [expirationDate, setExpirationDate] = useState('');
  const [serviceCode, setServiceCode] = useState('101');
  const [amount, setAmount] = useState('100.00');
  const [paymentMetadata, setPaymentMetadata] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [qrDataContent, setQrDataContent] = useState('');
  const [qrFilename, setQrFilename] = useState('payment_qr.png');
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrPreviewRef = useRef<HTMLImageElement>(null);

  // Simulated API/DB Status
  const [apiStatus, setApiStatus] = useState('Offline');
  const [dbStatus, setDbStatus] = useState('Offline');
  const [simulatedAccountId, setSimulatedAccountId] = useState('');
  const [simulatedAccountBalance, setSimulatedAccountBalance] = useState('0.00');


  const calculateLuhnChecksum = useCallback((partialPan: string): number => {
    let sum = 0;
    let alternate = false;
    for (let i = partialPan.length - 1; i >= 0; i--) {
      let digit = parseInt(partialPan.charAt(i), 10);
      if (alternate) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      alternate = !alternate;
    }
    return (10 - (sum % 10)) % 10;
  }, []);

  const generatePAN = useCallback(() => {
    if (!cardType) return '';
    const config = CARD_CONFIGS[cardType];
    const prefix = config.prefixes[Math.floor(Math.random() * config.prefixes.length)];
    const length = config.length;
    let newPan = prefix;
    const remainingLength = length - prefix.length - 1;
    for (let i = 0; i < remainingLength; i++) {
      newPan += Math.floor(Math.random() * 10);
    }
    newPan += calculateLuhnChecksum(newPan);
    setPan(newPan);
    return newPan;
  }, [cardType, calculateLuhnChecksum]);

  const generateExpirationDate = useCallback(() => {
    const now = new Date();
    const year = (now.getFullYear() + 3) % 100;
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const newExpDate = `${year}${month}`;
    setExpirationDate(newExpDate);
    return newExpDate;
  }, []);

  const generatePaymentMetadata = useCallback(() => {
    if (!pan || !expirationDate || !serviceCode || !amount) return '';
    const cardTypeCode = cardType === 'visa' ? 'V' : cardType === 'mastercard' ? 'M' : 'A';
    const transactionId = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    const transactionType = 'P';
    const today = new Date();
    const transactionDate = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    const accId = simulatedAccountId || Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    if(!simulatedAccountId) setSimulatedAccountId(accId);
    const amountValue = parseFloat(amount).toFixed(2);
    const amountWhole = Math.floor(parseFloat(amountValue)).toString().padStart(5, '0');
    const amountDecimal = (amountValue.split('.')[1] || '00').padStart(2, '0');
    const meta = `COBOL-${cardTypeCode}${expirationDate}${serviceCode}${transactionId}${transactionType}${transactionDate}${accId}${amountWhole}${amountDecimal}`;
    setPaymentMetadata(meta);
    return meta;
  }, [pan, expirationDate, serviceCode, amount, cardType, simulatedAccountId]);


  const initializeForm = useCallback(() => {
    setServiceCode('101');
    setAmount('100.00');
    setCardholderName('DOE/JOHN');
    if (autoGenerate) {
      const newPan = generatePAN();
      const newExpDate = generateExpirationDate();
      setPan(newPan); // Ensure state is updated before metadata generation
      setExpirationDate(newExpDate); // Ensure state is updated
      // Use a timeout to ensure state updates before generating metadata
      setTimeout(() => {
         generatePaymentMetadata();
      },0);
    }
  }, [autoGenerate, generatePAN, generateExpirationDate, generatePaymentMetadata]);


  useEffect(() => {
    initializeForm();
    // Simulate API/DB connection
    setTimeout(() => setApiStatus('Online'), 500);
    setTimeout(() => setDbStatus('Connected - COBOL-SQLite Bridge Active'), 1000);
  }, [initializeForm]);

  useEffect(() => {
    if (autoGenerate && cardType) {
        const newPan = generatePAN();
        const newExpDate = generateExpirationDate();
         // Update dependent state directly if needed for metadata generation
        setPan(newPan);
        setExpirationDate(newExpDate);
        // Defer metadata generation to ensure PAN and ExpDate are set
        setTimeout(() => generatePaymentMetadata(), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, cardType]); // Removed generatePAN, generateExpirationDate from dependencies to avoid infinite loop. They are called inside.

  const generateQRCodeData = useCallback(() => {
    if (!pan || !cardholderName || !expirationDate || !serviceCode || !paymentMetadata) {
      toast({ title: "Missing Information", description: "Please ensure all card details are filled or generated.", variant: "destructive" });
      return;
    }
    
    const track1 = `${TRACK_FORMATS.track1.startSentinel}B${pan}${TRACK_FORMATS.track1.fieldSeparator}${cardholderName}${TRACK_FORMATS.track1.fieldSeparator}${expirationDate}${serviceCode}${paymentMetadata.substring(0,20)}${TRACK_FORMATS.track1.endSentinel}`;
    const track2 = `${TRACK_FORMATS.track2.startSentinel}${pan}${TRACK_FORMATS.track2.fieldSeparator}${expirationDate}${serviceCode}${paymentMetadata.substring(9,16)}${TRACK_FORMATS.track2.endSentinel}`;
    const track3 = `${TRACK_FORMATS.track3.startSentinel}${pan}${TRACK_FORMATS.track3.fieldSeparator}${paymentMetadata}${TRACK_FORMATS.track3.fieldSeparator}${parseFloat(amount).toFixed(2)}${TRACK_FORMATS.track3.fieldSeparator}${simulatedAccountId}${TRACK_FORMATS.track3.endSentinel}`;
    
    const combinedData = `T1:${track1}|T2:${track2}|T3:${track3}`;
    setQrDataContent(combinedData);

    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, combinedData, {
        width: 144, height: 144, margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'H'
      }, (error) => {
        if (error) {
          console.error('Error generating QR code:', error);
          toast({ title: "QR Generation Error", description: "Could not generate QR code.", variant: "destructive" });
        } else {
          toast({ title: "QR Code Generated", description: "Payment QR code is ready." });
          if(qrPreviewRef.current && qrCanvasRef.current) {
            qrPreviewRef.current.src = qrCanvasRef.current.toDataURL('image/png');
          }
        }
      });
    }
  }, [pan, cardholderName, expirationDate, serviceCode, paymentMetadata, amount, simulatedAccountId]);

  useEffect(() => {
    if(pan && expirationDate && paymentMetadata && autoGenerate){ // Generate QR when dependent auto-generated fields are ready
        generateQRCodeData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pan, expirationDate, paymentMetadata, autoGenerate]); // Do not add generateQRCodeData here to avoid loop


  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateQRCodeData();
    // Simulate payment processing
    if(simulatedAccountId && amount) {
        toast({title: "Processing Payment", description: "Simulating transaction..."});
        setTimeout(async () => {
            // Simulate API call
            const currentBalance = parseFloat(simulatedAccountBalance);
            const transactionAmount = parseFloat(amount);
            const newBalance = currentBalance - transactionAmount;
            setSimulatedAccountBalance(newBalance.toFixed(2));
            toast({title: "Payment Processed", description: `Transaction successful. New Balance: ${newBalance.toFixed(2)}`, variant: "default"});
        }, 1500);
    }
  };

  const handleSaveQr = () => {
    if (qrCanvasRef.current) {
      const dataUrl = qrCanvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = qrFilename || 'payment-qr.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "QR Code Saved", description: `${qrFilename || 'payment-qr.png'} downloaded.` });
    }
  };
  
  const copyQrDataToClipboard = () => {
    navigator.clipboard.writeText(qrDataContent)
      .then(() => toast({ title: "Copied", description: "QR data copied to clipboard." }))
      .catch(err => toast({ title: "Error", description: "Failed to copy QR data.", variant: "destructive" }));
  };

  const generateWalletPass = (walletType: WalletProviderKey) => {
    const cardData = {
      cardType,
      scheme: cardType.charAt(0).toUpperCase() + cardType.slice(1),
      pan,
      formattedPan: pan, // Simplified, real formatting would be more complex
      cardholderName: cardholderName.replace('/', ' '),
      expMonth: expirationDate.substring(2,4),
      expYear: '20' + expirationDate.substring(0,2),
      formattedExpDate: `${expirationDate.substring(2,4)}/${expirationDate.substring(0,2)}`,
      accountId: simulatedAccountId,
      amount: parseFloat(amount).toFixed(2)
    };

    let walletUrl = '';
    switch(walletType) {
      case 'apple':
        walletUrl = `applewallet://addpaymentpass?cardData=${encodeURIComponent(JSON.stringify(cardData))}`; // Placeholder URL
        break;
      case 'google':
        walletUrl = `googlepay://savepass?cardData=${encodeURIComponent(JSON.stringify(cardData))}`; // Placeholder URL
        break;
      case 'samsung':
        walletUrl = `samsungpay://addcard?cardData=${encodeURIComponent(JSON.stringify(cardData))}`; // Placeholder URL
        break;
    }

    if (qrCanvasRef.current) {
        QRCode.toCanvas(qrCanvasRef.current, `WALLET:${walletType.toUpperCase()}:${walletUrl}`, {
             width: 144, height: 144, margin: 1,
             color: { dark: '#000000', light: '#FFFFFF' },
             errorCorrectionLevel: 'H'
        }, (error) => {
            if(error) {
                toast({title: "Wallet QR Error", description: "Could not generate wallet QR.", variant: "destructive"});
            } else {
                toast({title: `${WALLET_PROVIDERS[walletType].name} Pass Ready`, description: "Scan QR with your mobile to add."});
                if(qrPreviewRef.current && qrCanvasRef.current) {
                  qrPreviewRef.current.src = qrCanvasRef.current.toDataURL('image/png');
                }
            }
        });
    }
    setShowWalletOptions(false);
  };


  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-auto">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <CreditCard className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">Payment Terminal</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Generate Payment QR Codes & Manage Simulated Transactions
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow p-2 space-y-6">
        <form id="qr-form" onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Details Column */}
          <div className="space-y-3 p-3 rounded-md glassmorphic !bg-background/30">
            <h4 className="text-lg font-semibold mb-2 text-accent radiant-text">Card Details</h4>
            <div>
              <Label htmlFor="card-type" className="radiant-text">Card Type</Label>
              <Select value={cardType} onValueChange={(value) => setCardType(value as CardType)}>
                <SelectTrigger id="card-type" className="mt-1 bg-input/70 focus:bg-input">
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="amex">American Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pan" className="radiant-text">Primary Account Number (PAN)</Label>
              <div className="flex items-center mt-1">
                <Input id="pan" value={pan} onChange={e => setPan(e.target.value)} readOnly={autoGenerate} className="bg-input/70 focus:bg-input" placeholder="Card Number" />
                {autoGenerate && <Button type="button" variant="ghost" size="icon" onClick={generatePAN} className="ml-2 button-3d-interactive"><RefreshCw className="w-4 h-4"/></Button>}
              </div>
            </div>
            <div>
              <Label htmlFor="cardholder-name" className="radiant-text">Cardholder Name</Label>
              <Input id="cardholder-name" value={cardholderName} onChange={e => setCardholderName(e.target.value)} className="mt-1 bg-input/70 focus:bg-input" placeholder="DOE/JOHN" />
            </div>
            <div>
              <Label htmlFor="expiration-date" className="radiant-text">Expiration Date (YYMM)</Label>
              <div className="flex items-center mt-1">
                <Input id="expiration-date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} readOnly={autoGenerate} className="bg-input/70 focus:bg-input" placeholder="YYMM" />
                {autoGenerate && <Button type="button" variant="ghost" size="icon" onClick={generateExpirationDate} className="ml-2 button-3d-interactive"><RefreshCw className="w-4 h-4"/></Button>}
              </div>
            </div>
            <div>
              <Label htmlFor="service-code" className="radiant-text">Service Code</Label>
              <Input id="service-code" value={serviceCode} onChange={e => setServiceCode(e.target.value)} readOnly={autoGenerate} className="mt-1 bg-input/70 focus:bg-input" placeholder="e.g., 101" />
            </div>
          </div>

          {/* Transaction & QR Column */}
          <div className="space-y-3 p-3 rounded-md glassmorphic !bg-background/30">
            <h4 className="text-lg font-semibold mb-2 text-accent radiant-text">Transaction & QR</h4>
            <div>
              <Label htmlFor="amount" className="radiant-text">Amount</Label>
              <Input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 bg-input/70 focus:bg-input" placeholder="0.00" />
            </div>
             <div>
              <Label htmlFor="payment-metadata" className="radiant-text">Payment Metadata (COBOL Format)</Label>
              <Textarea id="payment-metadata" value={paymentMetadata} readOnly className="mt-1 bg-input/70 focus:bg-input h-20 font-mono text-xs" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-generate-toggle" checked={autoGenerate} onCheckedChange={setAutoGenerate} />
              <Label htmlFor="auto-generate-toggle" className="radiant-text">Auto-generate Details</Label>
            </div>
            <Button type="submit" className="w-full button-3d-interactive">Generate QR & Process (Simulated)</Button>
            
            <div id="qr-container" className="mt-3 p-3 border border-primary/30 rounded-md text-center bg-card/50">
                <h5 className="text-md font-medium mb-2 text-primary radiant-text">Payment QR Code</h5>
                <canvas id="qr-code" ref={qrCanvasRef} width="144" height="144" className="mx-auto border border-muted rounded shadow-md bg-white"></canvas>
                <img ref={qrPreviewRef} alt="QR Code Preview" style={{display: 'none'}} />
                <div id="qr-data" className="mt-2 text-xs text-muted-foreground break-all max-h-20 overflow-y-auto p-1 bg-black/20 rounded radiant-text" title="QR Data String">{qrDataContent || "QR Data will appear here"}</div>
                 <div className="qr-buttons mt-3 flex flex-wrap justify-center gap-2">
                    <Button id="save-qr-button" type="button" onClick={handleSaveQr} variant="outline" size="sm" className="button-3d-interactive"><Save className="w-3.5 h-3.5 mr-1.5"/>Save QR</Button>
                    <Button id="copy-qr-data-button" type="button" onClick={copyQrDataToClipboard} variant="outline" size="sm" className="button-3d-interactive"><ClipboardCopy className="w-3.5 h-3.5 mr-1.5"/>Copy Data</Button>
                    <Button id="add-to-wallet" type="button" onClick={() => setShowWalletOptions(true)} className="wallet-button button-3d-interactive" size="sm"><Wallet className="w-3.5 h-3.5 mr-1.5"/>Add to Wallet</Button>
                    <Button id="reset-form-button" type="button" onClick={initializeForm} variant="destructive" size="sm" className="button-3d-interactive">Reset Form</Button>
                </div>
                <div className="qr-wallet-info">
                    <p>On mobile? Scan this QR code with your banking app or wallet app to add this payment card.</p>
                </div>
            </div>
          </div>
        </form>
        
        {/* Simulated Account Info Section */}
        <div className="mt-4 p-3 rounded-md glassmorphic !bg-background/30">
             <h4 className="text-lg font-semibold mb-2 text-accent radiant-text flex items-center"><Info className="w-5 h-5 mr-2"/>Simulated Account Status</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <p className="radiant-text text-muted-foreground">API Status: <span className={apiStatus === 'Online' ? 'text-green-400' : 'text-red-400'}>{apiStatus}</span></p>
                <p className="radiant-text text-muted-foreground">DB Status: <span className={dbStatus.startsWith('Connected') ? 'text-green-400' : 'text-red-400'}>{dbStatus}</span></p>
                <p className="radiant-text text-muted-foreground">Account ID: <span className="text-foreground">{simulatedAccountId || 'N/A'}</span></p>
                <p className="radiant-text text-muted-foreground">Account Balance: <span className="text-foreground">${simulatedAccountBalance}</span></p>
            </div>
        </div>

      </CardContent>
      <CardFooter className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20">
        Payment Terminal operates in a simulated environment. No real transactions occur.
      </CardFooter>

      {/* Wallet Options Modal */}
      {showWalletOptions && (
        <div id="wallet-options-modal" className="wallet-options">
          <button className="close-wallet-options" onClick={() => setShowWalletOptions(false)}>&times;</button>
          <h3>Choose Wallet Provider</h3>
          <div className="wallet-providers">
            {(Object.keys(WALLET_PROVIDERS) as WalletProviderKey[]).map(key => {
              const provider = WALLET_PROVIDERS[key];
              const isNativePlatform = 
                (key === 'apple' && typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)) || 
                (key === 'google' && typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent)) ||
                (key === 'samsung' && typeof navigator !== 'undefined' && /Samsung/.test(navigator.userAgent));
              return (
                <button key={key} className={`wallet-provider ${isNativePlatform ? 'native-wallet' : ''}`} data-wallet={key} onClick={() => generateWalletPass(key)}>
                  <div className="wallet-icon">{provider.icon}</div>
                  <span className="radiant-text">{provider.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
