
"use client";
import type * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { addDays, isPast } from 'date-fns';


// Superuser credentials
const SUPERUSER_USERNAME = "serpOS@GI";
const SUPERUSER_INITIAL_PASSWORD = "12345678";

type SubscriptionTier = 'admin' | 'trial' | 'paid_weekly' | 'paid_monthly' | 'free_limited';

interface UserRegistrationDetails {
  ipAddress?: string;
  deviceId?: string;
  registrationTimestamp?: string;
  provider: 'google' | 'microsoft' | 'yahoo' | 'credentials';
  projectInterest?: string;
}

interface StoredUserEntry {
  password?: string; 
  details: UserRegistrationDetails;
  subscriptionTier: SubscriptionTier;
  trialEndDate?: string; 
}

export interface AuthUser { // Exporting for use in other files like flows
  id: string;
  username: string;
  role: 'superuser' | 'user' | 'guest';
  details: UserRegistrationDetails;
  subscriptionTier: SubscriptionTier;
  trialEndDate?: string; // ISO date string
  isTrialActive?: boolean; // Derived property
}

type AuthStatus = 
  | 'loading'
  | 'needs_mode_selection'
  | 'needs_onboarding'
  | 'needs_login'
  | 'authenticated'
  | 'ghost_mode';

type SocialProvider = 'google' | 'microsoft' | 'yahoo';

interface AuthContextType {
  currentUser: AuthUser | null;
  authStatus: AuthStatus;
  isLoading: boolean;
  appMode: 'persistent' | 'ghost' | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  onboardUser: (username: string, pass: string, projectInterest?: string) => Promise<boolean>;
  selectMode: (mode: 'persistent' | 'ghost') => void;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  resetToModeSelection: () => void;
  switchToOnboarding: () => void;
  signInWithProvider: (provider: SocialProvider, projectInterest?: string) => Promise<boolean>;
  // New methods for subscription/trial - stubs for now
  endUserTrial: (username: string) => void; 
  upgradeSubscription: (username: string, newTier: 'paid_weekly' | 'paid_monthly') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  APP_MODE: 'binaryblocksphere_appMode',
  CURRENT_USER: 'binaryblocksphere_currentUser', 
  USERS_DATA: 'binaryblocksphere_usersData',
  SUPERUSER_PASSWORD: 'binaryblocksphere_superuserPassword'
};

const getSimulatedDeviceInfo = (): { ipAddress: string; deviceId: string } => {
  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem('binaryblocksphere_deviceId');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('binaryblocksphere_deviceId', deviceId);
    }
    const simulatedIp = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
    return { ipAddress: simulatedIp, deviceId };
  }
  return { ipAddress: 'server_ip_placeholder', deviceId: 'server_device_id_placeholder' };
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [appMode, setAppMode] = useState<'persistent' | 'ghost' | null>(null);

  const loadSuperuserPassword = (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.SUPERUSER_PASSWORD) || SUPERUSER_INITIAL_PASSWORD;
    }
    return SUPERUSER_INITIAL_PASSWORD;
  };

  const saveSuperuserPassword = (newPass: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SUPERUSER_PASSWORD, newPass);
    }
  };

  const loadUsersData = (): Record<string, StoredUserEntry> => {
    if (typeof window !== 'undefined') {
      const usersJson = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS_DATA);
      return usersJson ? JSON.parse(usersJson) : {};
    }
    return {};
  };

  const saveUsersData = (usersData: Record<string, StoredUserEntry>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USERS_DATA, JSON.stringify(usersData));
    }
  };

  const deriveUserProperties = (user: AuthUser | StoredUserEntry): AuthUser => {
    const baseUser = 'id' in user ? user : { id: '', username: '', role: 'guest', ...user } as AuthUser;
    let isActiveTrial = false;
    if (baseUser.subscriptionTier === 'trial' && baseUser.trialEndDate) {
      isActiveTrial = !isPast(new Date(baseUser.trialEndDate));
    }
    return { ...baseUser, isTrialActive: isActiveTrial };
  };


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      const storedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.APP_MODE) as 'persistent' | 'ghost' | null;
      setAppMode(storedMode);

      if (storedMode === 'persistent') {
        const storedUserJson = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
        if (storedUserJson) {
          const userFromStorage = JSON.parse(storedUserJson) as AuthUser;
          const fullUser = deriveUserProperties(userFromStorage);
           // Check if trial expired
          if (fullUser.subscriptionTier === 'trial' && fullUser.trialEndDate && isPast(new Date(fullUser.trialEndDate))) {
            fullUser.subscriptionTier = 'free_limited';
            fullUser.isTrialActive = false;
            // Persist this change
            localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(fullUser));
            const usersData = loadUsersData();
            if(usersData[fullUser.username]) {
                usersData[fullUser.username].subscriptionTier = 'free_limited';
                saveUsersData(usersData);
            }
            toast({ title: "Trial Expired", description: "Your free trial has ended. You are now on the limited free tier."});
          }
          setCurrentUser(fullUser);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('needs_login');
        }
      } else if (storedMode === 'ghost') {
        const { ipAddress, deviceId } = getSimulatedDeviceInfo();
        setCurrentUser(deriveUserProperties({ 
          id: 'ghost', 
          username: 'GhostUser', 
          role: 'guest', 
          details: { 
            provider: 'credentials', 
            ipAddress, 
            deviceId, 
            registrationTimestamp: new Date().toISOString() 
          },
          subscriptionTier: 'free_limited' // Ghosts don't get trials usually
        }));
        setAuthStatus('ghost_mode');
      } else {
        setAuthStatus('needs_mode_selection');
      }
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectMode = (mode: 'persistent' | 'ghost') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.APP_MODE, mode);
      setAppMode(mode);
      if (mode === 'ghost') {
        const { ipAddress, deviceId } = getSimulatedDeviceInfo();
        setCurrentUser(deriveUserProperties({ 
          id: 'ghost', 
          username: 'GhostUser', 
          role: 'guest', 
          details: { 
            provider: 'credentials', 
            ipAddress, 
            deviceId, 
            registrationTimestamp: new Date().toISOString() 
          },
          subscriptionTier: 'free_limited'
        }));
        setAuthStatus('ghost_mode');
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      } else { 
        setAuthStatus('needs_login');
      }
    }
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    let userToLoginData: StoredUserEntry | undefined;
    const usersData = loadUsersData();
    const superuserPassword = loadSuperuserPassword();
    const { ipAddress, deviceId } = getSimulatedDeviceInfo();

    let role: AuthUser['role'] = 'user';

    if (username === SUPERUSER_USERNAME && pass === superuserPassword) {
      userToLoginData = usersData[SUPERUSER_USERNAME] || {
        details: { 
          provider: 'credentials', 
          ipAddress, 
          deviceId, 
          registrationTimestamp: new Date().toISOString(),
          projectInterest: "System Administration"
        },
        subscriptionTier: 'admin'
      };
      role = 'superuser';
    } else if (usersData[username] && usersData[username].password === pass && usersData[username].details.provider === 'credentials') {
      userToLoginData = usersData[username];
      role = 'user';
    }

    if (userToLoginData) {
      let fullUser = deriveUserProperties({
        id: username, // Use username as ID for credential users if not otherwise set
        username,
        role,
        details: { ...userToLoginData.details, ipAddress, deviceId }, // Update with current login info
        subscriptionTier: userToLoginData.subscriptionTier,
        trialEndDate: userToLoginData.trialEndDate
      });

      // Check trial status on login
      if (fullUser.subscriptionTier === 'trial' && fullUser.trialEndDate && isPast(new Date(fullUser.trialEndDate))) {
          fullUser.subscriptionTier = 'free_limited';
          fullUser.isTrialActive = false;
          usersData[username].subscriptionTier = 'free_limited'; // Update stored data
          saveUsersData(usersData);
          toast({ title: "Trial Expired", description: "Your free trial has ended. You are now on the limited free tier."});
      }


      setCurrentUser(fullUser);
      setAuthStatus('authenticated');
      if (appMode === 'persistent') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(fullUser));
      }
      toast({ title: "Login Successful", description: `Welcome, ${fullUser.username}!` });
      return true;
    }
    toast({ title: "Login Failed", description: "Invalid username or password for credential-based login.", variant: "destructive" });
    return false;
  };

  const onboardUser = async (username: string, pass: string, projectInterest?: string): Promise<boolean> => {
    const usersData = loadUsersData();
    if (username === SUPERUSER_USERNAME) {
      toast({ title: "Onboarding Failed", description: "This username is reserved.", variant: "destructive" });
      return false;
    }
    if (usersData[username]) {
      toast({ title: "Onboarding Failed", description: "Username already exists.", variant: "destructive" });
      return false;
    }

    const { ipAddress, deviceId } = getSimulatedDeviceInfo();
    const registrationTimestamp = new Date().toISOString();
    const trialEndDate = addDays(new Date(), 7).toISOString();
    
    const newUserDetails: UserRegistrationDetails = {
        provider: 'credentials',
        ipAddress,
        deviceId,
        registrationTimestamp,
        projectInterest: projectInterest || 'Not specified'
    };

    usersData[username] = { 
        password: pass, 
        details: newUserDetails,
        subscriptionTier: 'trial',
        trialEndDate 
    };
    saveUsersData(usersData);
        
    const newUser = deriveUserProperties({ id: username, username, role: 'user', details: newUserDetails, subscriptionTier: 'trial', trialEndDate });
    setCurrentUser(newUser);
    setAuthStatus('authenticated');
    if (appMode === 'persistent') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    }
    toast({ title: "Onboarding Successful", description: `Welcome, ${username}! Your 7-day full access trial has started.` });
    return true;
  };

  const signInWithProvider = async (provider: SocialProvider, projectInterest?: string): Promise<boolean> => {
    toast({ title: `Simulating Sign-in with ${provider}`, description: `Processing...` });
    
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const { ipAddress, deviceId } = getSimulatedDeviceInfo();
    const registrationTimestamp = new Date().toISOString();
    const socialUserId = uuidv4();
    const username = `${provider.charAt(0).toUpperCase() + provider.slice(1)}User_${socialUserId.substring(0, 6)}`;
    const trialEndDate = addDays(new Date(), 7).toISOString();

    const newUserDetails: UserRegistrationDetails = {
      provider,
      ipAddress,
      deviceId,
      registrationTimestamp,
      projectInterest: projectInterest || 'Via social signup'
    };
    
    const usersData = loadUsersData();
    usersData[username] = { 
        details: newUserDetails, 
        subscriptionTier: 'trial', 
        trialEndDate 
    }; 
    saveUsersData(usersData);

    const user = deriveUserProperties({
      id: socialUserId, 
      username,
      role: 'user',
      details: newUserDetails,
      subscriptionTier: 'trial',
      trialEndDate
    });

    setCurrentUser(user);
    setAuthStatus('authenticated');
    if (appMode === 'persistent') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
    toast({ title: "Sign-in Successful", description: `Welcome, ${user.username}! (via ${provider}). Your 7-day trial has started.` });
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      const storedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.APP_MODE) as 'persistent' | 'ghost' | null;
      if (storedMode === 'persistent') {
         setAuthStatus('needs_login'); 
      } else if (storedMode === 'ghost') { 
        const { ipAddress, deviceId } = getSimulatedDeviceInfo();
        setCurrentUser(deriveUserProperties({ 
          id: 'ghost', 
          username: 'GhostUser', 
          role: 'guest', 
          details: { 
            provider: 'credentials', 
            ipAddress, 
            deviceId, 
            registrationTimestamp: new Date().toISOString() 
          },
          subscriptionTier: 'free_limited'
        }));
        setAuthStatus('ghost_mode');
      } else { 
        setAuthStatus('needs_mode_selection');
      }
    }
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!currentUser || currentUser.details.provider !== 'credentials') {
      toast({ title: "Error", description: currentUser?.details.provider !== 'credentials' ? "Password change is not available for social logins or guest users." : "No user logged in.", variant: "destructive" });
      return false;
    }

    const usersData = loadUsersData();
    const currentSuperuserPassword = loadSuperuserPassword();

    if (currentUser.role === 'superuser') {
      if (currentUser.username === SUPERUSER_USERNAME && oldPass === currentSuperuserPassword) {
        saveSuperuserPassword(newPass);
        toast({ title: "Password Changed", description: "Superuser password updated successfully." });
        return true;
      }
    } else if (usersData[currentUser.username] && usersData[currentUser.username].password === oldPass) {
      usersData[currentUser.username].password = newPass;
      saveUsersData(usersData);
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
      return true;
    }
    
    toast({ title: "Password Change Failed", description: "Incorrect old password.", variant: "destructive" });
    return false;
  };

  const resetToModeSelection = useCallback(() => {
    if (typeof window !== 'undefined') {
        setCurrentUser(null);
        setAppMode(null);
        setAuthStatus('needs_mode_selection');
        Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
            if (key !== LOCAL_STORAGE_KEYS.USERS_DATA && key !== LOCAL_STORAGE_KEYS.SUPERUSER_PASSWORD) { // Preserve users and superuser pass
                localStorage.removeItem(key);
            }
        });
        // Don't clear deviceId or all users data on simple mode reset
        // localStorage.removeItem('binaryblocksphere_deviceId'); 
    }
    toast({ title: "Mode Reset", description: "Returned to mode selection. User accounts are preserved." });
  }, []);

  const switchToOnboarding = () => {
    setAuthStatus('needs_onboarding');
  };

  const endUserTrial = (username: string) => {
    const usersData = loadUsersData();
    if (usersData[username] && usersData[username].subscriptionTier === 'trial') {
        usersData[username].subscriptionTier = 'free_limited';
        usersData[username].trialEndDate = undefined; // Clear trial end date
        saveUsersData(usersData);
        if (currentUser?.username === username) {
            setCurrentUser(prev => prev ? deriveUserProperties({...prev, subscriptionTier: 'free_limited', trialEndDate: undefined }) : null);
        }
        toast({ title: "Trial Ended", description: `Trial for ${username} has ended. Switched to free limited tier.`});
    }
  };

  const upgradeSubscription = (username: string, newTier: 'paid_weekly' | 'paid_monthly') => {
    const usersData = loadUsersData();
     if (usersData[username]) {
        usersData[username].subscriptionTier = newTier;
        usersData[username].trialEndDate = undefined; // Clear trial end date if any
        saveUsersData(usersData);
        if (currentUser?.username === username) {
            setCurrentUser(prev => prev ? deriveUserProperties({...prev, subscriptionTier: newTier, trialEndDate: undefined }) : null);
        }
        toast({ title: "Subscription Upgraded", description: `${username} is now on ${newTier.replace('_', ' ')}.`});
    }
  };


  useEffect(() => {
    if (typeof window !== 'undefined' && authStatus !== 'loading') {
        const usersData = loadUsersData();
        if (!usersData[SUPERUSER_USERNAME]) {
            const { ipAddress, deviceId } = getSimulatedDeviceInfo();
            usersData[SUPERUSER_USERNAME] = {
                password: loadSuperuserPassword(),
                details: {
                    provider: 'credentials',
                    ipAddress,
                    deviceId,
                    registrationTimestamp: new Date().toISOString(),
                    projectInterest: "System Administration"
                },
                subscriptionTier: 'admin', // Superuser is always admin tier
            };
            saveUsersData(usersData);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]); 

  return (
    <AuthContext.Provider value={{ currentUser, authStatus, isLoading, appMode, login, logout, onboardUser, selectMode, changePassword, resetToModeSelection, switchToOnboarding, signInWithProvider, endUserTrial, upgradeSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

if (typeof window !== 'undefined') {
  import('uuid').then(uuid => {
    (window as any).uuidv4 = uuid.v4;
  });
}
