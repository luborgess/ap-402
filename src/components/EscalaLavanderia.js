"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import Head from 'next/head';

const EscalaLavanderia = () => {

  const [moradores] = useState([
    "Luiz",
    "Lucas", 
    "Gabriel",
    "Próx. Morador",
    "Kelvin",
    "Natan",
    "Bruno",
    "Robson"
  ]);

  const DATA_INICIAL = new Date(2024, 10, 13); // 13/11/2024
  
  // Função para calcular a semana atual
  const calcularSemanaAtual = () => {
    const hoje = new Date();
    const diferencaEmDias = Math.floor((hoje - DATA_INICIAL) / (1000 * 60 * 60 * 24));
    const semanaAtual = Math.floor(diferencaEmDias / 7) + 1;
    return Math.max(1, semanaAtual); // Garante que não seja menor que 1
  };

  const [semanaAtual, setSemanaAtual] = useState(calcularSemanaAtual());

  // Atualiza a semana atual a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setSemanaAtual(calcularSemanaAtual());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  // Função para gerar as próximas datas a partir da data inicial
  const gerarDatas = (semanaOffset = 0) => {
    const dataInicial = new Date(DATA_INICIAL);
    dataInicial.setDate(dataInicial.getDate() + (semanaOffset - 1) * 7);
    
    const datas = [];
    for (let i = 0; i < 7; i++) {
      const novaData = new Date(dataInicial);
      novaData.setDate(novaData.getDate() + i);
      datas.push(novaData);
    }
    return datas;
  };

  const datasAtuais = gerarDatas(semanaAtual);

  // Função para verificar se a data é hoje
  const isHoje = (data) => {
    const hoje = new Date();
    return data.getDate() === hoje.getDate() &&
           data.getMonth() === hoje.getMonth() &&
           data.getFullYear() === hoje.getFullYear();
  };

  const formatarData = (data) => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMoradorDoDia = (diaIndex) => {
    const totalDiasPassados = ((semanaAtual - 1) * 7) + diaIndex;
    const moradorIndex = totalDiasPassados % moradores.length;
    return moradores[moradorIndex];
  };

  const formatarDataCalendario = (data, hora, minuto) => {
    const dataFormatada = new Date(data);
    dataFormatada.setHours(hora, minuto, 0);
    
    return dataFormatada.toISOString()
      .replace(/-|:|\.\d\d\d/g, '');
  };

  const adicionarAoCalendario = (data, morador) => {
    const titulo = `Lavanderia - ${morador}`;
    const descricao = `Horário reservado para ${morador} usar a máquina de lavar`;
    
    const dataInicio = formatarDataCalendario(data, 8, 0);
    const dataFim = formatarDataCalendario(data, 22, 0);
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${dataInicio}/${dataFim}&details=${encodeURIComponent(descricao)}`;
    
    window.open(url, '_blank');
  };

  return ( 
    
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden p-4 ">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-[400px] font-bold text-gray-100 select-none blur">
          402
        </div>
      </div>
      
      <Card className="w-full max-w-3xl relative backdrop-blur-sm bg-white/80 shadow-xl border border-white/50">
        <CardHeader className="text-center ">
          <CardTitle className="text-xl font-bold">Escala da Lavanderia AP 402</CardTitle>
          <div className="flex justify-center gap-4 mt-2">
            <button 
              onClick={() => setSemanaAtual(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
              disabled={semanaAtual === 1}
            >
              ← Semana Anterior
            </button>
            <button 
              onClick={() => setSemanaAtual(calcularSemanaAtual())}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Hoje
            </button>
            <button 
              onClick={() => setSemanaAtual(prev => prev + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Próxima Semana →
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 c:\Users\admin\Documents\Projects\402\republica-app">
            {datasAtuais.map((data, index) => {
              const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' });
              const moradorDoDia = getMoradorDoDia(index);
              const ehHoje = isHoje(data);
              
              return (
               
                <div 
                  key={data.toISOString()}
                  className={`flex items-center p-4 ${ehHoje ? 'bg-blue-100/50' : 'bg-white/50'} backdrop-blur-sm rounded-lg hover:bg-white/70 transition-colors relative `}
                >
                  {ehHoje && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                  )}
                  <div className="w-32 font-semibold capitalize">
                    {diaSemana}
                  </div>
                  <div className="w-32 text-gray-600">
                    {formatarData(data)}
                  </div>
                  <div className="flex-1 text-center font-medium text-blue-600">
                    {moradorDoDia}
                  </div>
                  <div className="w-32 text-right text-gray-600">
                    08:00 - 22:00
                  </div>
                  <button
                    onClick={() => adicionarAoCalendario(data, moradorDoDia)}
                    className="ml-4 p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                    title="Adicionar ao calendário"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            * A escala rotaciona entre os 8 moradores a cada 8 dias, os horários são sugestões.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalaLavanderia;