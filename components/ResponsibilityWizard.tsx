import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HierarchyLevel, Responsibility, Verb } from '../types';
import { INITIAL_VERBS } from '../constants';
import { BotMessage } from './BotMessage';

interface Props {
  level: HierarchyLevel;
  onSave: (resp: Responsibility) => void;
  onCancel: () => void;
  existingResp?: Responsibility;
  sequence: number;
}

export const ResponsibilityWizard: React.FC<Props> = ({ level, onSave, onCancel, existingResp, sequence }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<Responsibility>>(existingResp || { sequence });
  const [verbQuery, setVerbQuery] = useState(existingResp?.action1 || '');
  const [botWarning, setBotWarning] = useState<string | null>(null);
  
  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter verbs based on Hierarchy Level
  const recommendedVerbs = useMemo(() => {
    return INITIAL_VERBS.filter(v => v.type === 'Recomendado' && v.levels.includes(level));
  }, [level]);

  // Dynamic search filtering
  const filteredSuggestions = useMemo(() => {
    if (!verbQuery) return recommendedVerbs;
    const lowerQuery = verbQuery.toLowerCase();
    return recommendedVerbs.filter(v => 
      v.text.toLowerCase().includes(lowerQuery) || 
      v.description?.toLowerCase().includes(lowerQuery)
    );
  }, [recommendedVerbs, verbQuery]);

  // Handle Verb Selection from Dropdown
  const handleSelectSuggestion = (verb: Verb) => {
    setVerbQuery(verb.text);
    setData(prev => ({ ...prev, action1: verb.text }));
    setBotWarning(null);
    setShowSuggestions(false);
  };

  // Handle Verb Typing (Manual)
  const handleVerbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setVerbQuery(val);
    setData(prev => ({ ...prev, action1: val }));
    setShowSuggestions(true);
    
    // Check for bad verbs immediately
    const foundBad = INITIAL_VERBS.find(v => v.type === 'NO Recomendado' && v.text.toLowerCase() === val.toLowerCase());
    if (foundBad) {
      setBotWarning(`Verbo NO recomendado: ${foundBad.clarification}`);
    } else {
      setBotWarning(null);
    }
  };

  const handleNext = () => {
    if (step === 1 && !data.action1) return;
    if (step === 2 && !data.object) return;
    setStep(prev => prev + 1);
  };

  const handleFinish = () => {
    if (!data.result) return;
    onSave({
      id: data.id || crypto.randomUUID(),
      sequence: data.sequence || sequence,
      action1: data.action1!,
      action2: data.action2,
      object: data.object!,
      result: data.result!,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-hay-600 p-4 text-white flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold">Redactor de Responsabilidad (Paso {step}/3)</h3>
          <button onClick={onCancel} className="text-white/80 hover:text-white">✕</button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-6">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-hay-500' : 'bg-gray-200'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-hay-500' : 'bg-gray-200'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-hay-500' : 'bg-gray-200'}`} />
          </div>

          {/* Steps */}
          <div className="min-h-[300px]">
            {step === 1 && (
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-hay-900">1. QUÉ (Acción)</h4>
                <p className="text-sm text-gray-500">
                  Selecciona el verbo principal que define la acción. 
                  Filtrando para nivel: <span className="font-bold">{level}</span>.
                </p>
                
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium mb-1">Verbo Principal *</label>
                  <input
                    type="text"
                    value={verbQuery}
                    onChange={handleVerbChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-hay-500 outline-none"
                    placeholder="Escribe para buscar..."
                    autoComplete="off"
                  />
                  
                  {/* Custom Autocomplete Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 max-h-60 overflow-y-auto rounded-md shadow-lg">
                      {filteredSuggestions.map(v => (
                        <li 
                          key={v.id} 
                          onClick={() => handleSelectSuggestion(v)}
                          className="p-3 hover:bg-hay-50 cursor-pointer border-b last:border-b-0 text-sm flex flex-col"
                        >
                          <span className="font-bold text-hay-900">{v.text}</span>
                          <span className="text-gray-500 text-xs">{v.description}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {showSuggestions && verbQuery && filteredSuggestions.length === 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 p-3 text-sm text-gray-500 rounded-md shadow-lg">
                      No se encontraron verbos recomendados.
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">Verbo Secundario (Opcional)</label>
                  <input
                    type="text"
                    value={data.action2 || ''}
                    onChange={e => setData({...data, action2: e.target.value})}
                    className="w-full border rounded-lg p-3 outline-none"
                    placeholder="Ej. Coordinar"
                  />
                </div>

                {botWarning && (
                  <BotMessage type="warning" message={botWarning} />
                )}
                
                {!botWarning && (
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                    <span className="font-bold">💡 Tip Plan Organizacional:</span> Usa infinitivos (Ej. Planificar, Ejecutar). Evita gerundios.
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-hay-900">2. CÓMO (Objeto/Medio)</h4>
                 <BotMessage 
                    type="info" 
                    message="Describe sobre qué o a través de qué se realiza la acción. Debe ser concreto (Ej. los estados financieros, el personal subordinado)." 
                  />
                <textarea
                  value={data.object || ''}
                  onChange={e => setData({...data, object: e.target.value})}
                  className="w-full border rounded-lg p-4 h-32 focus:ring-2 focus:ring-hay-500 outline-none resize-none"
                  placeholder="Ej. ...los planes de mantenimiento preventivo..."
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-hay-900">3. PARA QUÉ (Resultado)</h4>
                <BotMessage 
                    type="info" 
                    message="Describe el resultado final que la función aporta a la organización. (Ej. a fin de asegurar la rentabilidad anual)." 
                  />
                <textarea
                  value={data.result || ''}
                  onChange={e => setData({...data, result: e.target.value})}
                  className="w-full border rounded-lg p-4 h-32 focus:ring-2 focus:ring-hay-500 outline-none resize-none"
                  placeholder="Ej. ...para asegurar la disponibilidad operativa de la maquinaria."
                />
                
                <div className="mt-4 p-4 bg-hay-50 border border-hay-200 rounded-lg">
                  <h5 className="text-xs uppercase font-bold text-hay-600 mb-2">Vista Previa</h5>
                  <p className="text-gray-800 italic">
                    "{data.action1} {data.action2 ? `/ ${data.action2}` : ''} {data.object || '...'} para {data.result || '...'}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-between shrink-0">
          {step > 1 ? (
            <button onClick={() => setStep(prev => prev - 1)} className="px-4 py-2 text-gray-600 font-medium">
              Atrás
            </button>
          ) : <div></div>}
          
          {step < 3 ? (
            <button 
              onClick={handleNext} 
              disabled={step === 1 && !!botWarning}
              className="px-6 py-2 bg-hay-600 text-white rounded-lg hover:bg-hay-700 disabled:opacity-50 transition-colors"
            >
              Siguiente
            </button>
          ) : (
            <button 
              onClick={handleFinish} 
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
            >
              Guardar Responsabilidad
            </button>
          )}
        </div>
      </div>
    </div>
  );
};