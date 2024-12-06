import React from 'react';
import { useEscalaLavanderia } from './useEscalaLavanderia';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DownloadSection = ({ selectedPerson, onPersonSelect, onDownload }) => {
  const { residents } = useEscalaLavanderia();

  return (
    <div className="mt-4">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-white">
              Escala Semestral
            </h3>
            <p className="text-gray-400">
              Baixe sua escala personalizada
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPerson}
              onChange={onPersonSelect}
              className="bg-gray-800/50 text-gray-200 px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" className="bg-gray-900">Selecione seu nome</option>
              {residents.map((person, index) => (
                <option key={index} value={person} className="bg-gray-900">
                  {person}
                </option>
              ))}
            </select>

            {selectedPerson && (
              <Button
                onClick={onDownload}
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <Download className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
