import React from 'react';
import { HierarchyLevel } from '../types';

interface GuideModuleProps {
  onStart: () => void;
}

export const GuideModule: React.FC<GuideModuleProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-hay-900 p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Bienvenido al Asistente de Descripción de Puestos</h1>
          <p className="text-hay-100 text-lg">Guía metodológica para la redacción efectiva bajo el estándar de Plan Organizacional</p>
        </div>

        <div className="p-8 grid gap-8">
          
          {/* Section 1: The Formula */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-hay-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              La Fórmula del Éxito
            </h2>
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
              <p className="mb-4 text-gray-700">Toda función o responsabilidad debe responder a tres preguntas clave en una sola oración:</p>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 flex-1 w-full">
                  <span className="block text-xs font-bold text-blue-600 uppercase mb-1">¿QUÉ HACE?</span>
                  <div className="font-bold text-gray-900 text-lg">Verbo de Acción</div>
                  <p className="text-xs text-gray-500 mt-2">Infinitivo (Ej. Planificar)</p>
                </div>
                <span className="text-2xl text-blue-300 font-bold">+</span>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 flex-1 w-full">
                  <span className="block text-xs font-bold text-blue-600 uppercase mb-1">¿CÓMO LO HACE?</span>
                  <div className="font-bold text-gray-900 text-lg">Objeto / Medio</div>
                  <p className="text-xs text-gray-500 mt-2">Sobre qué recae la acción</p>
                </div>
                <span className="text-2xl text-blue-300 font-bold">+</span>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 flex-1 w-full">
                  <span className="block text-xs font-bold text-blue-600 uppercase mb-1">¿PARA QUÉ?</span>
                  <div className="font-bold text-gray-900 text-lg">Resultado Final</div>
                  <p className="text-xs text-gray-500 mt-2">El impacto en el negocio</p>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600 italic bg-white/50 p-2 rounded border border-dashed border-gray-300">
                Ejemplo: "<strong>Garantizar</strong> (Qué) el mantenimiento de la maquinaria (Cómo) <strong>para asegurar la continuidad operativa</strong> (Para qué)."
              </div>
            </div>
          </section>

          {/* Section 2: Verbs & Hierarchy */}
          <div className="grid md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-hay-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Niveles y Verbos
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-gray-200 hover:border-hay-500 transition-colors">
                  <h3 className="font-bold text-hay-800">{HierarchyLevel.STRATEGIC}</h3>
                  <p className="text-sm text-gray-600 mb-2">Puestos que definen el rumbo a largo plazo.</p>
                  <div className="flex flex-wrap gap-2">
                    {['Planificar', 'Dirigir', 'Definir', 'Aprobar'].map(v => (
                      <span key={v} className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-700">{v}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 hover:border-hay-500 transition-colors">
                  <h3 className="font-bold text-hay-800">{HierarchyLevel.TACTICAL}</h3>
                  <p className="text-sm text-gray-600 mb-2">Puestos que traducen estrategia en planes operativos.</p>
                  <div className="flex flex-wrap gap-2">
                    {['Controlar', 'Coordinar', 'Gestionar', 'Asegurar'].map(v => (
                      <span key={v} className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-700">{v}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 hover:border-hay-500 transition-colors">
                  <h3 className="font-bold text-hay-800">{HierarchyLevel.OPERATIONAL}</h3>
                  <p className="text-sm text-gray-600 mb-2">Puestos enfocados en la ejecución diaria.</p>
                  <div className="flex flex-wrap gap-2">
                    {['Ejecutar', 'Operar', 'Registrar', 'Realizar'].map(v => (
                      <span key={v} className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-700">{v}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Do's and Dont's */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-hay-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Reglas de Oro
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <div>
                    <strong className="block text-gray-800">Cuidado con "Colaborar" o "Apoyar"</strong>
                    <p className="text-sm text-gray-600">Estos verbos son vagos. Si los usas, debes especificar exactamente cuál es tu contribución única. El sistema te alertará.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-green-500 text-xl">✅</span>
                  <div>
                    <strong className="block text-gray-800">Usa el Asistente Automático</strong>
                    <p className="text-sm text-gray-600">Al agregar funciones, usa el "Mago" (Wizard) que te sugerirá verbos según el nivel de tu puesto.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-green-500 text-xl">✅</span>
                  <div>
                    <strong className="block text-gray-800">Valida con Inteligencia Artificial</strong>
                    <p className="text-sm text-gray-600">Usa el botón "Validar con IA" antes de finalizar. El sistema revisará la coherencia entre tu nivel, presupuesto y funciones usando la Metodología de Plan Organizacional.</p>
                  </div>
                </li>
              </ul>
            </section>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-8 flex flex-col items-center border-t border-gray-200">
          <p className="text-gray-500 mb-6 text-center max-w-2xl">
            Al hacer clic en comenzar, accederás al formulario oficial. Podrás imprimirlo al finalizar el flujo de aprobación.
          </p>
          <button 
            onClick={onStart}
            className="bg-hay-600 hover:bg-hay-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transform transition hover:-translate-y-1"
          >
            Comenzar Descripción de Puesto
          </button>
        </div>
      </div>
    </div>
  );
};