'use client';

import Image from "next/image";
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import EscalaIntegrada from '@/components/EscalaIntegrada';
import Auth from '@/components/Auth';

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <Header />
      <Hero />
      
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          <section id="escalas">
            <EscalaIntegrada />
          </section>
        </div>
      </main>
    </div>
  );
}
