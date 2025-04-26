
import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';

interface RouteProtectionProps {
  children: ReactNode;
}

export const RouteProtection = ({ children }: RouteProtectionProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // Public pages that don't require authentication
  const publicPages = ["/", "/login", "/staff-login", "/services", "/appointments", "/auth", "/auth-google-callback"];

  useEffect(() => {
    let isMounted = true;
    let timeout: NodeJS.Timeout;
    
    const checkSession = async () => {
      try {
        console.log("RouteProtection: Checking path", location.pathname);
        
        // If it's a public page, no need for session check
        const isPublicPage = publicPages.some(page => 
          location.pathname === page || location.pathname.startsWith(`${page}/`)
        );
        
        if (isPublicPage) {
          if (isMounted) setChecking(false);
          console.log("RouteProtection: Public page, no check needed");
          return;
        }

        // Special case for profile setup
        if (location.pathname === "/profile-setup") {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            navigate('/login');
          } else {
            setChecking(false);
          }
          return;
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          if (isMounted) {
            console.log("No session, redirecting to login");
            navigate('/login');
          }
          return;
        }
        
        const userRole = session.user.user_metadata?.role;
        console.log("Current user role:", userRole, "at pathname:", location.pathname);
        
        // Admin route check - allow shop-home if user is admin
        if ((location.pathname === '/shop-home' || 
            location.pathname.startsWith('/shop-')) && 
            userRole === 'admin') {
          console.log("Admin accessing shop pages, allowing access");
          if (isMounted) setChecking(false);
          return;
        }
            
        // If user is not admin, check if they are connected to a shop as staff
        if ((location.pathname === '/shop-home' || 
            location.pathname.startsWith('/shop-')) && 
            userRole === 'staff') {
          
          // For staff, check if they are connected to a shop
          const { data: personelData } = await supabase
            .from('personel')
            .select('dukkan_id')
            .eq('auth_id', session.user.id)
            .maybeSingle();
          
          console.log("Staff shop check:", personelData);
            
          if (!personelData?.dukkan_id) {
            // Staff not connected to any shop, redirect to unassigned staff page
            console.log("Staff not connected to shop, redirecting to unassigned-staff");
            navigate('/unassigned-staff');
            return;
          }
        }
        
        // Unassigned staff page is only accessible by staff or admin
        if (location.pathname === '/unassigned-staff') { 
          if (userRole !== 'staff' && userRole !== 'admin') {
            // Not staff or admin, redirect to login
            navigate('/login');
            return;
          }
          
          if (userRole === 'staff') {
            // Check if staff is already assigned to a shop
            const { data: personelData } = await supabase
              .from('personel')
              .select('dukkan_id')
              .eq('auth_id', session.user.id)
              .maybeSingle();
              
            if (personelData?.dukkan_id) {
              // Staff already connected to a shop, redirect to staff profile
              console.log("Staff already connected to shop, redirecting to staff-profile");
              navigate('/staff-profile');
              return;
            }
          }
        }
        
        // Staff profile is only accessible by staff or admin
        if (location.pathname === '/staff-profile' && 
            userRole !== 'staff' && 
            userRole !== 'admin') {
          navigate('/login');
          return;
        }
        
        // If staff tries to access staff-profile, make sure they are assigned to a shop
        if (location.pathname === '/staff-profile' && userRole === 'staff') {
          const { data: personelData } = await supabase
            .from('personel')
            .select('dukkan_id')
            .eq('auth_id', session.user.id)
            .maybeSingle();
            
          if (!personelData?.dukkan_id) {
            // Staff not connected to a shop, redirect to unassigned staff page
            console.log("Staff not connected to shop, redirecting to unassigned-staff");
            navigate('/unassigned-staff');
            return;
          }
        }
        
        // Customer routes are only for customers
        if ((location.pathname.startsWith('/customer-') || 
             location.pathname === '/customer-dashboard') && 
            userRole !== 'customer') {
          navigate('/login');
          return;
        }
        
        if (isMounted) setChecking(false);
      } catch (error) {
        console.error("RouteProtection: Unexpected error", error);
        if (isMounted) setChecking(false);
      }
    };
    
    checkSession();
    
    // Set a maximum timeout to avoid infinite loading
    timeout = setTimeout(() => {
      if (isMounted) setChecking(false);
    }, 2000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [location.pathname, navigate]);

  if (checking && !publicPages.includes(location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};
