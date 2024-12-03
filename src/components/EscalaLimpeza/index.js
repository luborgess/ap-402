import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

const EscalaLimpeza = () => {
  // Configuração das escalas
  const escalas = {
    banheiroEsquerdo: ['Lucas', 'Bruno', 'Kelvin', 'Robson'],
    banheiroDireito: ['Luiz', 'Gabriel', 'Natan', 'Fulano'],
    salaCozinha: [
      ['Bruno', 'Fulano'],
      ['Luiz', 'Lucas'],
      ['Gabriel', 'Natan'],
      ['Kelvin', 'Robson']
    ]
  };

  // Função para obter a data atual formatada
  const getFormattedDate = (addDays = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + addDays);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Escala de Limpeza</h2>
      
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 mx-auto max-w-3xl">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Aviso de Manutenção:</span> O sistema de limpeza está passando por manutenção programada. Algumas funcionalidades podem estar temporariamente indisponíveis.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banheiro Esquerdo */}
        <Card className="escala-card">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <h3 className="text-xl font-semibold">Banheiro Esquerdo</h3>
            <p className="text-sm opacity-90">Próximas 4 semanas</p>
          </CardHeader>
          <CardContent className="p-4">
            {escalas.banheiroEsquerdo.map((pessoa, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="font-medium">{pessoa}</span>
                <span className="text-gray-600">{getFormattedDate(index * 7)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Banheiro Direito */}
        <Card className="escala-card">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <h3 className="text-xl font-semibold">Banheiro Direito</h3>
            <p className="text-sm opacity-90">Próximas 4 semanas</p>
          </CardHeader>
          <CardContent className="p-4">
            {escalas.banheiroDireito.map((pessoa, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="font-medium">{pessoa}</span>
                <span className="text-gray-600">{getFormattedDate(index * 7)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sala e Cozinha */}
      <Card className="escala-card mt-6">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <h3 className="text-xl font-semibold">Sala e Cozinha</h3>
          <p className="text-sm opacity-90">Próximas 4 semanas</p>
        </CardHeader>
        <CardContent className="p-4">
          {escalas.salaCozinha.map((dupla, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
              <span className="font-medium">{dupla[0]} e {dupla[1]}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{getFormattedDate(index * 7)}</span>
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalaLimpeza;
