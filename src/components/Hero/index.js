import React from 'react';
import { Calendar, Home, Settings } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32 bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Bem-vindo ao
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {' '}AP 402
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Organize a rotina do apartamento de forma simples e eficiente.
            Acompanhe as escalas de limpeza e lavanderia em um só lugar.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12">
          <Feature
            icon={<Home className="h-8 w-8 text-blue-600" />}
            title="Organização"
            description="Mantenha o apartamento organizado com escalas claras e bem definidas."
          />
          <Feature
            icon={<Calendar className="h-8 w-8 text-blue-600" />}
            title="Planejamento"
            description="Acompanhe suas responsabilidades e programe-se com antecedência."
          />
          <Feature
            icon={<Settings className="h-8 w-8 text-blue-600" />}
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
    <div className="glass-card rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        {icon}
      </div>
      <h2 className="mt-6 text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}
