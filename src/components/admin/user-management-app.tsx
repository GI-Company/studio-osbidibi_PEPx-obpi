
"use client";
import type * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth, type AuthUser, type StoredUserEntry } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, ShieldCheck, ShieldAlert, Crown, Edit3, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

type EditableUser = AuthUser & { isEditing?: boolean; originalTier?: AuthUser['subscriptionTier'] };

export function UserManagementApp() {
  const { currentUser, upgradeSubscription, endUserTrial } = useAuth();
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role === 'superuser') {
      setIsLoading(true);
      // Simulate fetching all users data from localStorage
      const usersDataString = localStorage.getItem('binaryblocksphere_usersData');
      const usersData: Record<string, StoredUserEntry> = usersDataString ? JSON.parse(usersDataString) : {};
      
      const loadedUsers: EditableUser[] = Object.entries(usersData).map(([username, storedEntry]) => {
        const role = username === 'serpOS@GI' ? 'superuser' : 'user';
        // Ensure details object exists
        const details = storedEntry.details || { provider: 'credentials', ipAddress: 'N/A', deviceId: 'N/A', registrationTimestamp: 'N/A' };
        
        let isTrialActive = false;
        if (storedEntry.subscriptionTier === 'trial' && storedEntry.trialEndDate) {
            const trialEndDate = new Date(storedEntry.trialEndDate);
            isTrialActive = trialEndDate > new Date();
        }

        return {
          id: username, // Using username as ID for simplicity here
          username,
          role,
          details,
          subscriptionTier: storedEntry.subscriptionTier,
          trialEndDate: storedEntry.trialEndDate,
          isTrialActive,
          isEditing: false,
          originalTier: storedEntry.subscriptionTier,
        };
      });
      setUsers(loadedUsers);
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleTierChange = (username: string, newTier: AuthUser['subscriptionTier']) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.username === username ? { ...user, subscriptionTier: newTier } : user
      )
    );
  };

  const toggleEditMode = (username: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.username === username ? { ...user, isEditing: !user.isEditing, subscriptionTier: user.originalTier || user.subscriptionTier } : { ...user, isEditing: false }
      )
    );
  };

  const saveTierChange = (username: string, newTier: AuthUser['subscriptionTier']) => {
    const userToUpdate = users.find(u => u.username === username);
    if (!userToUpdate) return;

    if (newTier === 'trial') {
        toast({ title: "Action Not Allowed", description: "Cannot manually set a user to 'trial'. Trial is an initial state.", variant: "destructive"});
        // Revert UI change
        handleTierChange(username, userToUpdate.originalTier || userToUpdate.subscriptionTier);
        toggleEditMode(username);
        return;
    }
    
    // Call the appropriate AuthContext function
    if (newTier === 'free_limited' && userToUpdate.originalTier === 'trial') {
      endUserTrial(username); // If they were on trial and moved to free, end trial.
    } else if (newTier === 'paid_weekly' || newTier === 'paid_monthly') {
      upgradeSubscription(username, newTier);
    } else if (newTier === 'free_limited') {
        // If user was on a paid tier and moved to free_limited, this implies cancellation.
        // For now, just update the local state and AuthContext.
        const usersData = JSON.parse(localStorage.getItem('binaryblocksphere_usersData') || '{}');
        if (usersData[username]) {
            usersData[username].subscriptionTier = newTier;
            localStorage.setItem('binaryblocksphere_usersData', JSON.stringify(usersData));
        }
        toast({ title: "Tier Changed", description: `${username}'s tier set to ${newTier}.`, variant: "default"});
    }


    // Update originalTier and exit editing mode
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.username === username ? { ...user, isEditing: false, originalTier: newTier, subscriptionTier: newTier } : user
      )
    );
  };

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
    return <div className="flex items-center justify-center w-full h-full p-4"><p className="radiant-text">Loading user data...</p></div>;
  }

  const tierOptions: AuthUser['subscriptionTier'][] = ['admin', 'paid_monthly', 'paid_weekly', 'free_limited'];


  return (
    <div className="flex flex-col w-full h-full p-2 md:p-4 bg-card text-card-foreground rounded-md overflow-hidden">
      <CardHeader className="pb-3 text-center">
        <div className="flex items-center justify-center mb-2">
          <Users className="w-8 h-8 mr-2 text-primary" />
          <CardTitle className="text-2xl radiant-text">User Management Console</CardTitle>
        </div>
        <CardDescription className="radiant-text">
          View and manage user accounts and subscription tiers.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-2 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="radiant-text">Username</TableHead>
              <TableHead className="radiant-text">Role</TableHead>
              <TableHead className="radiant-text">Tier</TableHead>
              <TableHead className="radiant-text">Trial Active</TableHead>
              <TableHead className="radiant-text">Provider</TableHead>
              <TableHead className="text-right radiant-text">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium radiant-text">{user.username}</TableCell>
                <TableCell>
                    <Badge variant={user.role === 'superuser' ? 'destructive' : 'secondary'} className="capitalize radiant-text">
                        {user.role === 'superuser' && <Crown className="w-3 h-3 mr-1"/>}
                        {user.role}
                    </Badge>
                </TableCell>
                <TableCell>
                  {user.isEditing && user.username !== 'serpOS@GI' ? (
                    <Select 
                        value={user.subscriptionTier} 
                        onValueChange={(newTier) => handleTierChange(user.username, newTier as AuthUser['subscriptionTier'])}
                    >
                      <SelectTrigger className="w-[150px] h-8 text-xs">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {tierOptions.filter(t => t !== 'admin' && t !== 'trial').map(tier => (
                          <SelectItem key={tier} value={tier} className="capitalize text-xs">
                            {tier.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={user.subscriptionTier === 'admin' ? 'destructive' : user.subscriptionTier === 'trial' ? 'default' : 'outline'} className="capitalize radiant-text">
                      {user.subscriptionTier === 'admin' ? <ShieldCheck className="w-3 h-3 mr-1"/> : user.subscriptionTier.includes('paid') ? <ShieldCheck className="w-3 h-3 mr-1"/> : <ShieldAlert className="w-3 h-3 mr-1"/>}
                      {user.subscriptionTier.replace('_', ' ')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="radiant-text">
                  {user.isTrialActive ? 'Yes' : 'No'}
                  {user.subscriptionTier === 'trial' && user.trialEndDate && <span className="text-xs text-muted-foreground ml-1"> (Ends: {new Date(user.trialEndDate).toLocaleDateString()})</span>}
                </TableCell>
                <TableCell className="radiant-text capitalize">{user.details.provider}</TableCell>
                <TableCell className="text-right">
                  {user.username !== 'serpOS@GI' && (
                    user.isEditing ? (
                      <Button variant="ghost" size="sm" onClick={() => saveTierChange(user.username, user.subscriptionTier)} className="text-primary button-3d-interactive">
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => toggleEditMode(user.username)} className="text-accent button-3d-interactive">
                        <Edit3 className="w-4 h-4 mr-1" /> Edit Tier
                      </Button>
                    )
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
       <div className="p-2 text-xs text-center text-muted-foreground/70 border-t border-primary/20">
        User data is managed locally. Changes affect the current browser session.
      </div>
    </div>
  );
}
