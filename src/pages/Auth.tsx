
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This is a legacy page, we'll redirect users to the correct routes
export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new login page
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}
