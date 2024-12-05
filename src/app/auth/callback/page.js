'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // Redirect to root path
        router.push('/');
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.push('/');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Autenticando...</h2>
        <p className="text-gray-600">Por favor, aguarde.</p>
      </div>
    </div>
  );
}
