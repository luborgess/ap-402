import React from 'react';
import { useEscalaLavanderia } from './useEscalaLavanderia';

export const DownloadSection = ({ selectedPerson, onPersonSelect, onDownload }) => {
  const { residents } = useEscalaLavanderia();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="mt-4 sm:mt-6 bg-white/10 rounded-lg p-4 sm:p-6 shadow-lg backdrop-blur-md flex flex-col sm:flex-row items-center justify-between">
        <h3 className="bg-blue-600 rounded-md text-lg sm:text-xl font-semibold mb-2 sm:mb-0 px-2 py-1 text-white">
          Escala semestral:
        </h3>
        <div className="flex items-center gap-4 justify-center px-2 py-1">
          <select
            value={selectedPerson}
            onChange={onPersonSelect}
            className="bg-blue-600 px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
          >
            <option value="">Selecione seu nome</option>
            {residents.map((person, index) => (
              <option key={index} value={person}>{person}</option>
            ))}
          </select>
          {selectedPerson && (
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Download ⬇️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
