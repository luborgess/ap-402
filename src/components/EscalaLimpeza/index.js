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
