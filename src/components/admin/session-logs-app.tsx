
"use client";
import type * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth, type AuthUser } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, User, Clock, Laptop, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SessionLog {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  ipAddress?: string;
  deviceType: 'desktop' | 'mobile';
  status: 'success' | 'failure' | 'info';
}

// Dummy log generator
const generateDummyLogs = (count: number): SessionLog[] => {
  const logs: SessionLog[] = [];
  const actions = ["Logged In", "Accessed GDE", "Launched App: OSbidibi Shell", "Changed Password", "Ended Session", "Attempted Invalid Action", "Launched App: Browser"];
  const users = ["AliceWonder", "BobTheBuilder", "CharlieRoot", "DavidUser", "EveTester"];
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const date = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7); // Logs from last 7 days
    logs.push({
      id: `log-${Date.now()}-${i}`,
      timestamp: date.toISOString(),
      username: user,
      action: actions[Math.floor(Math.random() * actions.length)],
      ipAddress: `192.168.1.${Math.floor(Math.random() * 253) + 1}`,
      deviceType: Math.random() > 0.3 ? 'desktop' : 'mobile',
      status: Math.random() > 0.15 ? 'success' : (Math.random() > 0.5 ? 'info' : 'failure'),
    });
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export function SessionLogsApp() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role === 'superuser') {
      setIsLoading(true);
      // Simulate fetching logs
      setTimeout(() => {
        setLogs(generateDummyLogs(50)); // Generate 50 dummy logs
        setIsLoading(false);
      }, 1000);
    }
  }, [currentUser]);

  if (currentUser?.role !== 'superuser') {
    return (
      <div className="flex items-center justify-center w-full h-full p-4">
        <Card className="w-full max-w-md glassmorphic">
          <CardHeader>
            <CardTitle className="text-center text-destructive radiant-text">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground radiant-text">You do not have permission to access this area.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center w-full h-full p-4"><p className="radiant-text">Loading session logs...</p></div>;
  }

  const getStatusColor = (status: SessionLog['status']) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failure': return 'text-red-400';
      case 'info': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };


  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-hidden">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <Activity className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">User Session Logs</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          Conceptual overview of user activity within the BinaryBlocksphere environment.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-2 overflow-hidden">
        <ScrollArea className="h-full p-1 -m-1">
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-md glassmorphic !bg-card/70 border border-border/30 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1.5 text-accent" />
                    <span className="font-medium text-foreground radiant-text">{log.username}</span>
                  </div>
                  <Badge variant={log.status === 'success' ? 'default' : log.status === 'failure' ? 'destructive' : 'secondary'} className={`text-xs ${getStatusColor(log.status)} capitalize`}>
                    {log.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground radiant-text">{log.action}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground/80">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    {log.deviceType === 'desktop' ? <Laptop className="w-3 h-3 mr-1" /> : <Smartphone className="w-3 h-3 mr-1" />}
                    <span>{log.ipAddress} ({log.deviceType})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <div className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20">
        Session logs are conceptual and for demonstration purposes only.
      </div>
    </div>
  );
}

