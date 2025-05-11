
"use client";
import type * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Superuser credentials
const SUPERUSER_USERNAME = "serpOS@GI";
const SUPERUSER_INITIAL_PASSWORD = "12345678";

interface UserRegistrationDetails {
  ipAddress?: string;
  deviceId?: string;
  registrationTimestamp?: string;
  provider: 'google' | 'microsoft' | 'yahoo' | 'credentials';
  projectInterest?: string; // Example of more detailed registration info
  // Other relevant details for 'serpOS@GI' to see
}

interface StoredUserEntry {
  password?: string; // Only for 'credentials' provider
  details: UserRegistrationDetails;
}

interface User {
  id: string;
  username: string;
  role: 'superuser' | 'user' | 'guest';
  details: UserRegistrationDetails; // Include full details here
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
  currentUser: User | null;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  APP_MODE: 'binaryblocksphere_appMode',
  CURRENT_USER: 'binaryblocksphere_currentUser', 
  USERS_DATA: 'binaryblocksphere_usersData', // Changed from USERS to USERS_DATA
  ONBOARDING_COMPLETE: 'binaryblocksphere_onboardingComplete', // This might be redundant if currentUser implies onboarding
  SUPERUSER_PASSWORD: 'binaryblocksphere_superuserPassword'
};

// Helper function to simulate IP and Device ID
const getSimulatedDeviceInfo = (): { ipAddress: string; deviceId: string } => {
  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem('binaryblocksphere_deviceId');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('binaryblocksphere_deviceId', deviceId);
    }
    // IP simulation is very basic. Real IP needs server-side or external API.
    const simulatedIp = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
    return { ipAddress: simulatedIp, deviceId };
  }
  return { ipAddress: 'server_ip_placeholder', deviceId: 'server_device_id_placeholder' };
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('uuid').then(uuid => { /* UUID loaded */ });

      setIsLoading(true);
      const storedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.APP_MODE) as 'persistent' | 'ghost' | null;
      setAppMode(storedMode);

      if (storedMode === 'persistent') {
        const storedUserJson = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
        if (storedUserJson) {
          const user = JSON.parse(storedUserJson) as User;
          setCurrentUser(user);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('needs_login');
        }
      } else if (storedMode === 'ghost') {
        const { ipAddress, deviceId } = getSimulatedDeviceInfo();
        setCurrentUser({ 
          id: 'ghost', 
          username: 'GhostUser', 
          role: 'guest', 
          details: { 
            provider: 'credentials', 
            ipAddress, 
            deviceId, 
            registrationTimestamp: new Date().toISOString() 
          } 
        });
        setAuthStatus('ghost_mode');
      } else {
        setAuthStatus('needs_mode_selection');
      }
      setIsLoading(false);
    }
  }, []);

  const selectMode = (mode: 'persistent' | 'ghost') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.APP_MODE, mode);
      setAppMode(mode);
      if (mode === 'ghost') {
        const { ipAddress, deviceId } = getSimulatedDeviceInfo();
        setCurrentUser({ 
          id: 'ghost', 
          username: 'GhostUser', 
          role: 'guest', 
          details: { 
            provider: 'credentials', 
            ipAddress, 
            deviceId, 
            registrationTimestamp: new Date().toISOString() 
          } 
        });
        setAuthStatus('ghost_mode');
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      } else { 
        setAuthStatus('needs_login'); // Persistent mode will require login or onboarding
      }
    }
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    let userToLogin: User | null = null;
    const usersData = loadUsersData();
    const superuserPassword = loadSuperuserPassword();
    const { ipAddress, deviceId } = getSimulatedDeviceInfo();

    if (username === SUPERUSER_USERNAME && pass === superuserPassword) {
      userToLogin = { 
        id: SUPERUSER_USERNAME, 
        username, 
        role: 'superuser', 
        details: { 
          provider: 'credentials', 
          ipAddress, 
          deviceId, 
          registrationTimestamp: usersData[SUPERUSER_USERNAME]?.details.registrationTimestamp || new Date().toISOString() 
        } 
      };
    } else if (usersData[username] && usersData[username].password === pass && usersData[username].details.provider === 'credentials') {
      userToLogin = { 
        id: username, 
        username, 
        role: 'user', 
        details: { ...usersData[username].details, ipAddress, deviceId } // Update with current login info
      };
    }

    if (userToLogin) {
      setCurrentUser(userToLogin);
      setAuthStatus('authenticated');
      if (appMode === 'persistent') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(userToLogin));
      }
      toast({ title: "Login Successful", description: `Welcome, ${userToLogin.username}!` });
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
    
    const newUserDetails: UserRegistrationDetails = {
        provider: 'credentials',
        ipAddress,
        deviceId,
        registrationTimestamp,
        projectInterest: projectInterest || 'Not specified'
    };

    usersData[username] = { password: pass, details: newUserDetails };
    saveUsersData(usersData);
        
    const newUser: User = { id: username, username, role: 'user', details: newUserDetails };
    setCurrentUser(newUser);
    setAuthStatus('authenticated');
    if (appMode === 'persistent') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    }
    toast({ title: "Onboarding Successful", description: `Welcome, ${username}! Your account has been created.` });
    return true;
  };

  const signInWithProvider = async (provider: SocialProvider, projectInterest?: string): Promise<boolean> => {
    toast({ title: `Simulating Sign-in with ${provider}`, description: `Processing... In a real app, this would involve OAuth SDKs.` });
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    const { ipAddress, deviceId } = getSimulatedDeviceInfo();
    const registrationTimestamp = new Date().toISOString();
    const socialUserId = uuidv4();
    const username = `${provider.charAt(0).toUpperCase() + provider.slice(1)}User_${socialUserId.substring(0, 6)}`;

    const newUserDetails: UserRegistrationDetails = {
      provider,
      ipAddress,
      deviceId,
      registrationTimestamp,
      projectInterest: projectInterest || 'Via social signup'
    };
    
    // Store social user data (no password)
    const usersData = loadUsersData();
    usersData[username] = { details: newUserDetails }; // Store by generated username
    saveUsersData(usersData);

    const user: User = {
      id: socialUserId, // Use the UUID as the primary ID
      username,
      role: 'user',
      details: newUserDetails
    };

    setCurrentUser(user);
    setAuthStatus('authenticated');
    if (appMode === 'persistent') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
    toast({ title: "Sign-in Successful", description: `Welcome, ${user.username}! (via ${provider})` });
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
        setCurrentUser({ 
          id: 'ghost', 
          username: 'GhostUser', 
          role: 'guest', 
          details: { 
            provider: 'credentials', 
            ipAddress, 
            deviceId, 
            registrationTimestamp: new Date().toISOString() 
          } 
        });
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
        Object.values(LOCAL_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        localStorage.removeItem('binaryblocksphere_deviceId'); // Also clear deviceId
    }
    toast({ title: "System Reset", description: "System state cleared. Please select an operating mode." });
  }, []);

  const switchToOnboarding = () => {
    setAuthStatus('needs_onboarding');
  };

  // Ensure superuser exists in usersData (primarily for registration timestamp)
  useEffect(() => {
    if (typeof window !== 'undefined' && authStatus !== 'loading') {
        const usersData = loadUsersData();
        if (!usersData[SUPERUSER_USERNAME]) {
            const { ipAddress, deviceId } = getSimulatedDeviceInfo();
            usersData[SUPERUSER_USERNAME] = {
                password: loadSuperuserPassword(), // It should use its own password mechanism
                details: {
                    provider: 'credentials',
                    ipAddress,
                    deviceId,
                    registrationTimestamp: new Date().toISOString(),
                    projectInterest: "System Administration"
                }
            };
            saveUsersData(usersData);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]); // Run once after initial load

  return (
    <AuthContext.Provider value={{ currentUser, authStatus, isLoading, appMode, login, logout, onboardUser, selectMode, changePassword, resetToModeSelection, switchToOnboarding, signInWithProvider }}>
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

// Make uuidv4 available on window for client-side use after dynamic import
if (typeof window !== 'undefined') {
  import('uuid').then(uuid => {
    (window as any).uuidv4 = uuid.v4;
  });
}
