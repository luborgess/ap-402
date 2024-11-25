import Image from "next/image";
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import EscalaIntegrada from '@/components/EscalaIntegrada';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          <section id="escalas" className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Escalas da Semana
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Acompanhe suas responsabilidades e mantenha o AP 402 organizado.
              </p>
            </div>

            <EscalaIntegrada />
          </section>
        </div>
      </main>
    </div>
  );
}
