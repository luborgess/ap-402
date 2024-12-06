import React from 'react';
import { Calendar, Home, Settings } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Efeito de brilho */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.08),transparent_50%)]" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-blue-400 to-gray-200">
            Bem-vindo ao AP 402
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-400 max-w-2xl mx-auto">
            Organize a rotina do apartamento de forma simples e eficiente.
            Acompanhe as escalas de limpeza e lavanderia em um só lugar.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12">
          <Feature
            icon={<Home className="h-8 w-8 text-blue-400" />}
            title="Organização"
            description="Mantenha o apartamento organizado com escalas claras e bem definidas."
          />
          <Feature
            icon={<Calendar className="h-8 w-8 text-blue-400" />}
            title="Planejamento"
            description="Acompanhe suas responsabilidades e programe-se com antecedência."
          />
          <Feature
            icon={<Settings className="h-8 w-8 text-blue-400" />}
            title="Personalização"
            description="Configure as escalas de acordo com a rotina dos moradores."
          />
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 text-center hover:scale-105 transition-all duration-300">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 ring-1 ring-blue-500/20">
        {icon}
      </div>
      <h2 className="mt-6 text-lg font-semibold text-gray-200">{title}</h2>
      <p className="mt-2 text-gray-400">{description}</p>
    </div>
  );
}
