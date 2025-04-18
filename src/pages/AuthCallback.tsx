import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setIsLoading(true);
        
        // Get the session to see if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          // Try to exchange the code for a session
          const code = searchParams.get('code');
          if (!code) {
            throw new Error('No code provided in redirect');
          }
          
          // Exchange the code for a session
          const { error: signInError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (signInError) {
            throw signInError;
          }
        }
        
        // User is authenticated at this point
        // Check if the user is new (needs to complete profile) or existing
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not found after authentication');
        }
        
        // Check if the user has a profile (existing user)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
          throw new Error('Failed to fetch user profile');
        }
        
        if (!profile) {
          // New user - needs to complete registration
          navigate('/register-profile', { replace: true });
        } else {
          // Existing user - redirect based on role
          const role = profile.role || user.user_metadata?.role;
          
          if (role === 'staff' || role === 'admin') {
            navigate('/shop-home', { replace: true });
          } else if (role === 'customer') {
            navigate('/customer-dashboard', { replace: true });
          } else {
            // Default case
            navigate('/', { replace: true });
          }
        }
        
        toast.success('Giriş başarılı!');
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Kimlik doğrulama sırasında bir hata oluştu');
        toast.error('Kimlik doğrulama sırasında bir hata oluştu');
        // Navigate to login after short delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    handleCallback();
  }, [navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-purple-800 text-lg">Giriş yapılıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="text-center">{error}</p>
          <p className="text-center mt-2">Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  // This is a fallback that shouldn't be seen, since we navigate away in the useEffect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50">
      <p className="text-purple-800">Yönlendiriliyor...</p>
    </div>
  );
}
