import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const OAuthRedirectHandler = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Get the session from URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          navigate('/auth?error=oauth_error');
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to home
          navigate('/');
        } else {
          // No session, redirect to auth page
          navigate('/auth');
        }
      } catch (error) {
        console.error('OAuth redirect error:', error);
        navigate('/auth?error=oauth_error');
      }
    };

    // Check if we're on a redirect URL (has hash with auth data)
    if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
      handleAuthRedirect();
    }
  }, [navigate]);

  // Show loading while processing redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Memproses autentikasi...</p>
      </div>
    </div>
  );
};
