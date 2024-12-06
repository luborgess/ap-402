'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign, Divide, Users, Zap, Phone, Shield, Flame, Wrench, WrenchIcon, ShieldAlert } from 'lucide-react';

export default function UtilidadesPage() {
  const [valorTotal, setValorTotal] = useState('');
  const [numPessoas, setNumPessoas] = useState('');
  const [resultado, setResultado] = useState(null);

  const calcularDivisao = () => {
    const total = parseFloat(valorTotal);
    const pessoas = parseInt(numPessoas);

    if (isNaN(total) || isNaN(pessoas) || pessoas <= 0) {
      setResultado({ error: 'Por favor, insira valores válidos' });
      return;
    }

    const valorPorPessoa = total / pessoas;
    setResultado({
      valorPorPessoa: valorPorPessoa.toFixed(2),
      total: total.toFixed(2)
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto py-6 px-4 sm:px-6 space-y-6">
        {/* Header da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="bg-purple-500/10 p-3 rounded-full w-fit">
            <Calculator className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Utilidades</h1>
            <p className="text-sm sm:text-base text-gray-400">Ferramentas úteis para o dia a dia</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Calculadora de Divisão de Contas */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <CardTitle className="text-lg text-white">Divisão de Contas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Valor Total</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={valorTotal}
                      onChange={(e) => setValorTotal(e.target.value)}
                      className="pl-9 bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Número de Pessoas</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      placeholder="2"
                      value={numPessoas}
                      onChange={(e) => setNumPessoas(e.target.value)}
                      className="pl-9 bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <Button 
                  onClick={calcularDivisao}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Divide className="h-4 w-4 mr-2" />
                  Calcular
                </Button>

                {resultado && !resultado.error && (
                  <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-gray-400 mb-2">Resultado:</p>
                    <p className="text-lg font-semibold text-white">
                      R$ {resultado.valorPorPessoa} por pessoa
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Total: R$ {resultado.total}
                    </p>
                  </div>
                )}

                {resultado?.error && (
                  <p className="text-red-400 text-sm mt-2">{resultado.error}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Calculadora de Consumo de Energia */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-lg text-white">Consumo de Energia</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Potência do Aparelho (Watts)</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    className="bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Horas de Uso por Dia</label>
                  <Input
                    type="number"
                    placeholder="2"
                    className="bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                  <Zap className="h-4 w-4 mr-2" />
                  Calcular Consumo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contatos Úteis */}
          <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 md:col-span-2">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-lg text-white">Contatos Úteis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <h3 className="text-white font-medium mb-2">Emergência</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-red-400" />
                      <span>SAMU: 192</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span>Polícia: 190</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-400" />
                      <span>Bombeiros: 193</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <h3 className="text-white font-medium mb-2">Serviços</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-center gap-2">
                      <WrenchIcon className="h-4 w-4 text-gray-400" />
                      <span>Síndico: (11) 99999-9999</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <WrenchIcon className="h-4 w-4 text-gray-400" />
                      <span>Zelador: (11) 98888-8888</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-gray-400" />
                      <span>Portaria: (11) 97777-7777</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
