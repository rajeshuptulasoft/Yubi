import { useState, useEffect } from 'react';
import { authAPI, getApiErrorMessage, getLoginFailureMessage } from '@/lib/api';
import { sessionUserFromAuthResponse } from '@/utils/sessionUser';
import { toast } from 'sonner';

/**
 * Custom hook for user authentication
 * Handles login, logout, and token management
 */
export function useUserAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('yubiUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsLoggedIn(true);
        } catch (e) {
          console.error('Failed to parse user data:', e);
          localStorage.removeItem('yubiUser');
          setIsLoggedIn(false);
        }
      }
    };
    checkUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.userLogin(email, password);

      if (response?.success === false) {
        const errorMessage = getLoginFailureMessage(
          response,
          'Invalid email or password.',
        );
        toast.error(errorMessage);
        setIsLoggedIn(false);
        return { success: false, error: errorMessage };
      }

      const session = sessionUserFromAuthResponse(response);
      if (session) {
        localStorage.setItem('yubiUser', JSON.stringify(session));
        setUser(session);
        setIsLoggedIn(true);

        toast.success('Login successful! Welcome back!');
        return { success: true, user: session };
      }

      const errorMessage = getLoginFailureMessage(
        response,
        'No token received from server.',
      );
      toast.error(errorMessage);
      setIsLoggedIn(false);
      return { success: false, error: errorMessage };
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Login failed. Please check your credentials.',
      );
      toast.error(errorMessage);
      setIsLoggedIn(false);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      // Call logout API if needed
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state and storage
      localStorage.removeItem('yubiUser');
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
      toast.success('Logged out successfully');
    }
  };

  // Get auth token
  const getToken = () => {
    return user?.token || null;
  };

  // Get user ID
  const getUserId = () => {
    return user?.id || null;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user is delivery partner
  const isDeliveryPartner = () => {
    return user?.role === 'delivery';
  };

  // Update user data
  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    localStorage.setItem('yubiUser', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  return {
    user,
    loading,
    isLoggedIn,
    login,
    logout,
    getToken,
    getUserId,
    isAdmin,
    isDeliveryPartner,
    updateUser,
  };
}
