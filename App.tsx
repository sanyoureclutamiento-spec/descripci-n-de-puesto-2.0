import React, { useState, useEffect } from 'react';
import { JobDescription, HierarchyLevel, WorkflowStatus, Responsibility, Relationship, Challenge, Decision } from './types';
import { ResponsibilityWizard } from './components/ResponsibilityWizard';
import { BotMessage } from './components/BotMessage';
import { GuideModule } from './components/GuideModule';
import { checkConsistency } from './services/geminiService';

// Initial Empty State
const INITIAL_JOB: JobDescription = {
  id: 'new',
  title: '',
  reportsTo: '',
  area: '',
  department: '',
  location: '',
  level: HierarchyLevel.TACTICAL,
  
  occupantName: '',
  occupantDate: '',
  managerName: '',
  managerDate: '',
  hrName: '',
  hrDate: '',

  missionGuide: '',
  missionResult: '',
  missionAction: '',
  missionObject: '',
  
  responsibilities: [],
  internalRelations: Array(4).fill(null).map(() => ({ id: crypto.randomUUID(), entity: '', purpose: '' })),
  externalRelations: Array(4).fill(null).map(() => ({ id: crypto.randomUUID(), entity: '', purpose: '' })),
  
  subordinatesDirect: '',
  subordinatesIndirect: '',
  totalPersonnel: '',
  budgetOperating: '',
  budgetIncome: '',
  managementScope: '',
  otherIndicators: '',
  
  challenges: Array(2).fill(null).map(() => ({ id: crypto.randomUUID(), situation: '' })),
  decisions: Array(2).fill(null).map(() => ({ id: crypto.randomUUID(), description: '' })),
  
  orgChart: {
    managerOfManager: '',
    manager: '',
    peers: [],
    subordinates: Array(8).fill('') // Slot for up to 8 direct reports boxes
  },
  
  profile: {
    travel: false,
    travelFrequency: undefined,
    education: '',
    educationArea: '',
    knowledge: '',
    englishPercentage: 0,
    otherLanguage: '',
    otherLanguagePercentage: 0,
    experienceRequired: false,
    experienceAreas: Array(3).fill(null).map(() => ({ id: crypto.randomUUID(), area: '', level: '', years: '', other: '' }))
  },

  status: WorkflowStatus.DRAFT,
  version: 1,
  comments: '',
};

// Components defined outside to prevent re-mounting on every render
const SectionHeader = ({ title, number }: { title: string, number: number }) => (
  <div className="font-bold text-gray-900 mt-6 mb-2 text-sm uppercase">
    {number}. {title}
  </div>
);

const InputCell = ({ value, onChange, disabled, placeholder = "", className = "" }: any) => (
  <input
    type="text"
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    disabled={disabled}
    placeholder={disabled ? '' : placeholder}
    className={`w-full h-full min-h-[32px] p-2 bg-transparent outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-200 transition-colors placeholder-gray-400 ${className}`}
  />
);

export default function App() {
  const [showGuide, setShowGuide] = useState(true);
  const [job, setJob] = useState<JobDescription>(INITIAL_JOB);
  const [editingResp, setEditingResp] = useState<Responsibility | undefined>(undefined);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [consistencyResult, setConsistencyResult] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [missionWarning, setMissionWarning] = useState<string | null>(null);

  // --- Computed Values ---
  const currentYear = new Date().getFullYear();
  const missionPreview = `${job.missionGuide} ${job.missionResult} ${job.missionAction} ${job.missionObject}`;
  const isReadOnly = job.status !== WorkflowStatus.DRAFT;

  // --- Helpers ---
  const updateField = (field: keyof JobDescription, value: any) => {
    if (isReadOnly && field !== 'comments' && field !== 'status') return;
    setJob(prev => ({ ...prev, [field]: value }));
  };

  const updateProfile = (field: keyof typeof job.profile, value: any) => {
    if (isReadOnly) return;
    setJob(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  };

  const updateOrgChart = (field: keyof typeof job.orgChart, value: any) => {
    if (isReadOnly) return;
    setJob(prev => ({ ...prev, orgChart: { ...prev.orgChart, [field]: value } }));
  };

  const updateSubordinate = (index: number, value: string) => {
     if (isReadOnly) return;
     const newSubs = [...job.orgChart.subordinates];
     newSubs[index] = value;
     setJob(prev => ({ ...prev, orgChart: { ...prev.orgChart, subordinates: newSubs } }));
  };

  const updateArrayItem = (arrayName: 'internalRelations' | 'externalRelations' | 'challenges' | 'decisions', index: number, field: string, value: string) => {
    if (isReadOnly) return;
    // @ts-ignore dynamic access
    const newArray = [...job[arrayName]];
    newArray[index] = { ...newArray[index], [field]: value };
    // @ts-ignore
    setJob(prev => ({ ...prev, [arrayName]: newArray }));
  };

  // --- Handlers ---
  const handleAddResponsibility = () => {
    if (job.responsibilities.length >= 8) {
      alert("Máximo 8 funciones permitidas.");
      return;
    }
    setEditingResp(undefined);
    setIsWizardOpen(true);
  };

  const handleEditResponsibility = (resp: Responsibility) => {
    if (isReadOnly) return;
    setEditingResp(resp);
    setIsWizardOpen(true);
  };

  const handleSaveResponsibility = (newResp: Responsibility) => {
    setJob(prev => {
      const exists = prev.responsibilities.find(r => r.id === newResp.id);
      let updatedList;
      if (exists) {
        updatedList = prev.responsibilities.map(r => r.id === newResp.id ? newResp : r);
      } else {
        updatedList = [...prev.responsibilities, newResp];
      }
      return { ...prev, responsibilities: updatedList };
    });
    setIsWizardOpen(false);
  };

  const runConsistencyCheck = async () => {
    setIsChecking(true);
    setConsistencyResult(null);
    const result = await checkConsistency(job);
    setConsistencyResult(result);
    setIsChecking(false);
  };

  useEffect(() => {
    if (job.missionAction && job.missionObject && !job.missionResult) {
      setMissionWarning("Recuerda que la Misión debe incluir explícitamente el 'PARA QUÉ' (Resultado).");
    } else {
      setMissionWarning(null);
    }
  }, [job.missionGuide, job.missionResult, job.missionAction, job.missionObject]);

  // If in guide mode, show guide
  if (showGuide) {
    return <GuideModule onStart={() => setShowGuide(false)} />;
  }

  // Otherwise show Main App
  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
      {/* Navbar (No Print) */}
      <nav className="bg-hay-900 text-white shadow-lg sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowGuide(true)} className="mr-2 text-hay-100 hover:text-white">
               ← Guía
            </button>
            <span className="font-bold text-lg">Guía de Desarrollo de Descripción De Puestos</span>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={runConsistencyCheck}
                className="text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center gap-1"
              >
                {isChecking ? '...' : '🤖 Validar con IA'}
              </button>
            <span className="bg-gray-700 px-3 py-1 rounded text-xs uppercase tracking-wider">{job.status}</span>
            <button onClick={() => window.print()} className="bg-white text-hay-900 px-3 py-1 rounded shadow hover:bg-gray-200 text-sm">
              🖨️ Imprimir
            </button>
          </div>
        </div>
      </nav>

      {/* Main Document */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl my-8 print:my-0 print:shadow-none print:w-full">
        <div className="p-8 print:p-0">
          
          {/* Header */}
          <div className="flex justify-between items-end mb-4 border-b-2 border-transparent">
            <div className="w-32">
               {/* Logo Removed */}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Descripción de Puesto</h1>
          </div>

          {/* Alert Box (No Print) */}
          {consistencyResult && (
             <div className="no-print mb-6">
                <BotMessage type="warning" message={consistencyResult} onClose={() => setConsistencyResult(null)} />
             </div>
          )}

          {/* 1. Identificación */}
          <SectionHeader number={1} title="IDENTIFICACIÓN" />
          <div className="border border-gray-800 text-sm">
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Título del Puesto:</div>
              <InputCell disabled={isReadOnly} value={job.title} onChange={(v: string) => updateField('title', v)} />
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Reporta a:</div>
              <InputCell disabled={isReadOnly} value={job.reportsTo} onChange={(v: string) => updateField('reportsTo', v)} />
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Área:</div>
              <InputCell disabled={isReadOnly} value={job.area} onChange={(v: string) => updateField('area', v)} />
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Departamento:</div>
              <InputCell disabled={isReadOnly} value={job.department} onChange={(v: string) => updateField('department', v)} />
            </div>
            <div className="grid grid-cols-[150px_1fr]">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Ubicación física:</div>
              <InputCell disabled={isReadOnly} value={job.location} onChange={(v: string) => updateField('location', v)} placeholder="(Domicilio)" />
            </div>
          </div>
          
          <div className="no-print mt-2 text-xs text-gray-500 text-right">
             Nivel (Interno): 
             <select 
               value={job.level} 
               onChange={e => updateField('level', e.target.value)}
               className="ml-2 border rounded p-1"
               disabled={isReadOnly}
             >
               {Object.values(HierarchyLevel).map(l => <option key={l} value={l}>{l}</option>)}
             </select>
          </div>

          {/* 2. Revisiones y Aprobaciones */}
          <SectionHeader number={2} title="REVISIONES Y APROBACIONES" />
          <div className="border border-gray-800 text-sm">
            {/* Ocupante */}
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800 bg-gray-200">
              <div className="p-1 border-r border-gray-800"></div>
              <div className="p-1 font-bold text-center">Ocupante del puesto</div>
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Nombre completo:</div>
              <InputCell disabled={isReadOnly} value={job.occupantName} onChange={(v: string) => updateField('occupantName', v)} />
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Firma:</div>
              <div className="h-10"></div>
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Fecha:</div>
              <InputCell disabled={isReadOnly} value={job.occupantDate} onChange={(v: string) => updateField('occupantDate', v)} />
            </div>

            {/* Jefe */}
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800 bg-gray-200">
              <div className="p-1 border-r border-gray-800"></div>
              <div className="p-1 font-bold text-center">Jefe inmediato</div>
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Nombre completo:</div>
              <InputCell disabled={isReadOnly} value={job.managerName} onChange={(v: string) => updateField('managerName', v)} />
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Firma:</div>
              <div className="h-10"></div>
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Fecha:</div>
              <InputCell disabled={isReadOnly} value={job.managerDate} onChange={(v: string) => updateField('managerDate', v)} />
            </div>

            {/* RH */}
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800 bg-gray-200">
              <div className="p-1 border-r border-gray-800"></div>
              <div className="p-1 font-bold text-center">Recursos Humanos</div>
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Nombre completo:</div>
              <InputCell disabled={isReadOnly} value={job.hrName} onChange={(v: string) => updateField('hrName', v)} />
            </div>
            <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Firma:</div>
              <div className="h-10"></div>
            </div>
            <div className="grid grid-cols-[150px_1fr]">
              <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center">Fecha:</div>
              <InputCell disabled={isReadOnly} value={job.hrDate} onChange={(v: string) => updateField('hrDate', v)} />
            </div>
          </div>

          <div className="page-break"></div>

          {/* 3. Misión */}
          <SectionHeader number={3} title="MISION DEL PUESTO (Objetivo)" />
          <div className="border border-gray-800 bg-gray-100 min-h-[100px] p-4 text-sm relative group">
             <div className="font-medium text-gray-800">
                {missionPreview.trim() ? missionPreview : <span className="text-gray-400 italic">Redacte la misión usando el asistente (solo visible en edición)...</span>}
             </div>
             
             {/* Mission Assistant Inputs (Visible on hover/focus in Edit mode) */}
             {!isReadOnly && (
               <div className="no-print mt-4 p-4 bg-white border border-dashed border-gray-400 rounded shadow-sm">
                 <h4 className="font-bold text-xs text-hay-600 mb-3">Asistente de Redacción (QUÉ + CÓMO + PARA QUÉ)</h4>
                 {missionWarning && <BotMessage type="warning" message={missionWarning} />}
                 <div className="grid grid-cols-1 gap-3">
                   <div>
                      <label className="text-xs font-bold text-gray-500">1. Guía</label>
                      <input className="border rounded p-2 text-sm w-full focus:ring-2 focus:ring-hay-500 outline-none" placeholder="Ej. Bajo las políticas de calidad..." value={job.missionGuide} onChange={e => updateField('missionGuide', e.target.value)} />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-500">2. Resultado (PARA QUÉ)</label>
                      <input className="border rounded p-2 text-sm w-full focus:ring-2 focus:ring-hay-500 outline-none" placeholder="Ej. asegurar la rentabilidad anual..." value={job.missionResult} onChange={e => updateField('missionResult', e.target.value)} />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-500">3. Acción</label>
                      <input className="border rounded p-2 text-sm w-full focus:ring-2 focus:ring-hay-500 outline-none" placeholder="Ej. dirigiendo las operaciones de planta..." value={job.missionAction} onChange={e => updateField('missionAction', e.target.value)} />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-500">4. Objeto</label>
                      <input className="border rounded p-2 text-sm w-full focus:ring-2 focus:ring-hay-500 outline-none" placeholder="Ej. de la organización regional." value={job.missionObject} onChange={e => updateField('missionObject', e.target.value)} />
                   </div>
                 </div>
               </div>
             )}
          </div>

          {/* 4. Funciones Principales */}
          <SectionHeader number={4} title="FUNCIONES PRINCIPALES" />
          <div className="border border-gray-800 text-sm">
             {[...Array(8)].map((_, i) => {
                const resp = job.responsibilities[i];
                return (
                  <div key={i} className="flex border-b border-gray-800 last:border-b-0 min-h-[40px]">
                    <div className="w-10 bg-gray-200 border-r border-gray-800 flex items-center justify-center font-bold text-gray-600">
                      {i + 1}.
                    </div>
                    <div className="flex-1 p-2 relative group flex items-center">
                       {resp ? (
                         <div className="flex justify-between w-full items-center">
                           <span><span className="font-bold">{resp.action1}</span> {resp.action2 ? `/ ${resp.action2}` : ''} {resp.object} para {resp.result}</span>
                           {!isReadOnly && (
                             <button onClick={() => handleEditResponsibility(resp)} className="ml-2 text-blue-600 hover:text-blue-800 text-xs no-print px-2 py-1 bg-blue-50 rounded border border-blue-200 opacity-0 group-hover:opacity-100 transition-opacity">Editar</button>
                           )}
                         </div>
                       ) : (
                         !isReadOnly && (
                           <button onClick={handleAddResponsibility} className="text-gray-400 text-xs hover:text-hay-600 hover:bg-gray-50 no-print flex items-center justify-center h-full w-full py-1">
                             + Agregar Función
                           </button>
                         )
                       )}
                    </div>
                  </div>
                );
             })}
          </div>

          <div className="page-break"></div>

          {/* 5. Relaciones Internas */}
          <SectionHeader number={5} title="RELACIONES INTERNAS" />
          <div className="border border-gray-800 text-sm">
            <div className="grid grid-cols-2 bg-gray-200 border-b border-gray-800 font-bold text-center">
              <div className="border-r border-gray-800 p-2">Puesto / Área</div>
              <div className="p-2">Para qué</div>
            </div>
            {job.internalRelations.map((rel, i) => (
               <div key={rel.id} className="grid grid-cols-2 border-b border-gray-800 last:border-b-0 min-h-[40px]">
                  <div className="border-r border-gray-800">
                    <InputCell disabled={isReadOnly} value={rel.entity} onChange={(v: string) => updateArrayItem('internalRelations', i, 'entity', v)} />
                  </div>
                  <div>
                    <InputCell disabled={isReadOnly} value={rel.purpose} onChange={(v: string) => updateArrayItem('internalRelations', i, 'purpose', v)} />
                  </div>
               </div>
            ))}
          </div>

          {/* 6. Relaciones Externas */}
          <SectionHeader number={6} title="RELACIONES EXTERNAS" />
          <div className="border border-gray-800 text-sm">
            <div className="grid grid-cols-2 bg-gray-200 border-b border-gray-800 font-bold text-center">
              <div className="border-r border-gray-800 p-2">Institución</div>
              <div className="p-2">Para qué</div>
            </div>
            {job.externalRelations.map((rel, i) => (
               <div key={rel.id} className="grid grid-cols-2 border-b border-gray-800 last:border-b-0 min-h-[40px]">
                  <div className="border-r border-gray-800">
                    <InputCell disabled={isReadOnly} value={rel.entity} onChange={(v: string) => updateArrayItem('externalRelations', i, 'entity', v)} />
                  </div>
                  <div>
                    <InputCell disabled={isReadOnly} value={rel.purpose} onChange={(v: string) => updateArrayItem('externalRelations', i, 'purpose', v)} />
                  </div>
               </div>
            ))}
          </div>

          {/* 7. Dimensiones */}
          <SectionHeader number={7} title={`DIMENSIONES / INDICADORES ${currentYear}`} />
          <div className="border border-gray-800 text-sm">
            <div className="grid grid-cols-4 bg-gray-200 border-b border-gray-800 font-bold text-center">
              <div className="border-r border-gray-800 p-2">Concepto</div>
              <div className="border-r border-gray-800 p-2">Cantidad</div>
              <div className="border-r border-gray-800 p-2">Concepto</div>
              <div className="p-2">Cantidad</div>
            </div>
            
            {/* Row 1 */}
            <div className="grid grid-cols-4 border-b border-gray-800 min-h-[40px]">
              <div className="border-r border-gray-800 p-2 bg-gray-50 flex items-center">Personal subordinado directo:</div>
              <div className="border-r border-gray-800"><InputCell disabled={isReadOnly} value={job.subordinatesDirect} onChange={(v: string) => updateField('subordinatesDirect', v)} /></div>
              <div className="border-r border-gray-800 p-2 bg-gray-50 flex items-center">Presupuesto de operación:</div>
              <div><InputCell disabled={isReadOnly} value={job.budgetOperating} onChange={(v: string) => updateField('budgetOperating', v)} /></div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-4 border-b border-gray-800 min-h-[40px]">
              <div className="border-r border-gray-800 p-2 bg-gray-50 flex items-center">Personal subordinado indirecto:</div>
              <div className="border-r border-gray-800"><InputCell disabled={isReadOnly} value={job.subordinatesIndirect} onChange={(v: string) => updateField('subordinatesIndirect', v)} /></div>
              <div className="border-r border-gray-800 p-2 bg-gray-50 flex items-center">Presupuesto de Ingresos:</div>
              <div><InputCell disabled={isReadOnly} value={job.budgetIncome} onChange={(v: string) => updateField('budgetIncome', v)} /></div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-4 border-b border-gray-800 min-h-[40px]">
              <div className="border-r border-gray-800 p-2 bg-gray-50 flex items-center">Total de personal:</div>
              <div className="border-r border-gray-800"><InputCell disabled={isReadOnly} value={job.totalPersonnel} onChange={(v: string) => updateField('totalPersonnel', v)} /></div>
              <div className="border-r border-gray-800 p-2 bg-gray-50 row-span-2 flex items-center">Otros indicadores: (Anotar)</div>
              <div className="p-1 row-span-2">
                 <textarea 
                    className="w-full h-full min-h-[80px] p-2 resize-none outline-none bg-transparent focus:bg-blue-50 focus:ring-1 focus:ring-blue-200"
                    value={job.otherIndicators} 
                    onChange={e => updateField('otherIndicators', e.target.value)}
                    disabled={isReadOnly}
                 />
              </div>
            </div>

            {/* Row 4 */}
             <div className="grid grid-cols-4 min-h-[40px]">
              <div className="border-r border-gray-800 p-2 bg-gray-50 flex items-center">
                 Alcance de la Gestión:
              </div>
              <div className="border-r border-gray-800 p-1 flex flex-col justify-center text-xs px-4">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" checked={job.managementScope === 'Nacional'} onChange={() => updateField('managementScope', 'Nacional')} disabled={isReadOnly} /> Nacional
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" checked={job.managementScope === 'Internacional'} onChange={() => updateField('managementScope', 'Internacional')} disabled={isReadOnly} /> Internacional
                 </label>
              </div>
              {/* Empty cells to fill grid from Row 3 rowspan */}
            </div>
          </div>

          <div className="page-break"></div>

          {/* 8. Problemas / Retos */}
          <SectionHeader number={8} title="PRINCIPALES PROBLEMAS Y / O RETOS A LOS QUE SE ENFRENTA EL OCUPANTE DEL PUESTO" />
          <div className="border border-gray-800 text-sm">
             <div className="bg-gray-200 border-b border-gray-800 p-2 font-bold text-center">Situación</div>
             {job.challenges.map((ch, i) => (
               <div key={ch.id} className="flex border-b border-gray-800 last:border-b-0 min-h-[40px]">
                 <div className="w-10 border-r border-gray-800 flex items-center justify-center bg-gray-50">{i+1}.</div>
                 <div className="flex-1">
                   <InputCell disabled={isReadOnly} value={ch.situation} onChange={(v: string) => updateArrayItem('challenges', i, 'situation', v)} />
                 </div>
               </div>
             ))}
          </div>

          {/* 9. Decisiones */}
          <SectionHeader number={9} title="PRINCIPALES DECISIONES QUE SON DE TRASCENDENCIA PARA LA ORGANIZACIÓN" />
           <div className="border border-gray-800 text-sm">
             {job.decisions.map((dec, i) => (
               <div key={dec.id} className="flex border-b border-gray-800 last:border-b-0 min-h-[40px]">
                 <div className="w-10 border-r border-gray-800 flex items-center justify-center bg-gray-50">{i+1}.</div>
                 <div className="flex-1">
                   <InputCell disabled={isReadOnly} value={dec.description} onChange={(v: string) => updateArrayItem('decisions', i, 'description', v)} />
                 </div>
               </div>
             ))}
          </div>

          <div className="page-break"></div>

          {/* 10. Organigrama */}
          <SectionHeader number={10} title="ORGANIGRAMA" />
          <div className="p-4 flex flex-col items-center gap-6">
             {/* Level 1 */}
             <div className="flex flex-col items-center w-64">
               <div className="text-xs font-bold text-center mb-1">Nombre del puesto del Jefe del Jefe inmediato</div>
               <input className="border border-black p-2 text-center w-full text-sm focus:ring-2 focus:ring-hay-500 outline-none" value={job.orgChart.managerOfManager} onChange={e => updateOrgChart('managerOfManager', e.target.value)} disabled={isReadOnly} />
             </div>
             
             {/* Connector */}
             <div className="h-6 w-px bg-black -my-2"></div>

             {/* Level 2 */}
             <div className="flex flex-col items-center w-64">
               <div className="text-xs font-bold text-center mb-1">Nombre del puesto del Jefe inmediato</div>
               <input className="border border-black p-2 text-center w-full text-sm focus:ring-2 focus:ring-hay-500 outline-none" value={job.orgChart.manager} onChange={e => updateOrgChart('manager', e.target.value)} disabled={isReadOnly} />
             </div>

             {/* Connector Vertical to Horizontal */}
             <div className="h-6 w-px bg-black -my-2"></div>
             <div className="w-full max-w-2xl h-px bg-black relative"></div>

             {/* Level 3: Peers & Self */}
             <div className="grid grid-cols-2 gap-16 w-full max-w-3xl pt-4">
                {/* Peers */}
                <div>
                   <div className="text-xs font-bold text-center mb-1">Nombre de los puestos que reportan al mismo Jefe</div>
                   <textarea 
                     className="border border-black p-2 w-full h-24 text-sm resize-none focus:ring-2 focus:ring-hay-500 outline-none" 
                     value={job.orgChart.peers.join('\n')} 
                     onChange={e => updateOrgChart('peers', e.target.value.split('\n'))}
                     disabled={isReadOnly}
                   />
                </div>
                {/* Self */}
                <div>
                   <div className="text-xs font-bold text-center mb-1">Nombre del puesto que se describe</div>
                   <div className="border-4 border-black p-2 w-full h-24 flex items-center justify-center font-bold text-center bg-gray-100">
                      {job.title || 'TITULO DEL PUESTO'}
                   </div>
                </div>
             </div>
             
             {/* Level 4: Subordinates */}
             <div className="w-full max-w-2xl text-xs font-bold text-right pr-12 mt-4">Nombre de los puestos subordinados directos</div>
             <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">
                <div className="col-start-2 grid grid-cols-1 gap-2">
                   {job.orgChart.subordinates.map((sub, i) => (
                      <input 
                        key={i} 
                        className="border border-black p-2 text-center w-full text-xs focus:ring-2 focus:ring-hay-500 outline-none" 
                        value={sub} 
                        onChange={e => updateSubordinate(i, e.target.value)} 
                        disabled={isReadOnly}
                      />
                   ))}
                </div>
             </div>
          </div>
          
          <div className="page-break"></div>

          {/* 11. Perfil del Puesto */}
          <SectionHeader number={11} title="PERFIL DEL PUESTO" />
          <p className="text-xs text-gray-600 mb-2 text-justify">
             Describa objetivamente, las características que usted considere necesarias para cubrir el puesto, no tome en cuenta sus características personales, sino las que, según su experiencia, serían necesarias para lograr los resultados del puesto.
          </p>
          
          <div className="border border-gray-800 text-sm">
             {/* Travel */}
             <div className="grid grid-cols-[150px_1fr] border-b border-gray-800">
               <div className="bg-gray-200 p-2 font-bold border-r border-gray-800 flex items-center justify-center">Viajes de Trabajo</div>
               <div className="p-2">
                 <div className="flex gap-8 mb-2">
                    <label className="flex items-center gap-1 font-bold cursor-pointer">SI <input type="checkbox" checked={job.profile.travel} onChange={() => updateProfile('travel', true)} disabled={isReadOnly} /></label>
                    <label className="flex items-center gap-1 font-bold cursor-pointer">NO <input type="checkbox" checked={!job.profile.travel} onChange={() => updateProfile('travel', false)} disabled={isReadOnly} /></label>
                 </div>
                 <div className="flex gap-4 text-xs">
                    <span className="font-bold">Frecuencia:</span>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.profile.travelFrequency === 'Ocasionalmente'} onChange={() => updateProfile('travelFrequency', 'Ocasionalmente')} disabled={isReadOnly} /> Ocasionalmente</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={job.profile.travelFrequency === 'Frecuentemente'} onChange={() => updateProfile('travelFrequency', 'Frecuentemente')} disabled={isReadOnly} /> Frecuentemente</label>
                 </div>
               </div>
             </div>

             {/* Education */}
             <div className="grid grid-cols-2 border-b border-gray-800">
               <div className="border-r border-gray-800">
                 <div className="bg-gray-200 p-2 text-xs text-center border-b border-gray-800 font-bold">Escolaridad (licenciatura, ingeniería, maestría...)</div>
                 <div className="h-20">
                    <textarea className="w-full h-full p-2 resize-none outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-200" value={job.profile.education} onChange={e => updateProfile('education', e.target.value)} disabled={isReadOnly} />
                 </div>
               </div>
               <div>
                 <div className="bg-gray-200 p-2 text-xs text-center border-b border-gray-800 font-bold">Área o Especialidad (Administración, Contabilidad...)</div>
                 <div className="h-20">
                    <textarea className="w-full h-full p-2 resize-none outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-200" value={job.profile.educationArea} onChange={e => updateProfile('educationArea', e.target.value)} disabled={isReadOnly} />
                 </div>
               </div>
             </div>

             {/* Knowledge */}
             <div className="border-b border-gray-800">
                <div className="bg-gray-200 p-2 font-bold text-center border-b border-gray-800">CONOCIMIENTOS ESPECIALES Y CAPACITACIÓN</div>
                <div className="bg-gray-100 p-1 text-xs text-center border-b border-gray-800 font-bold">Área o Especialidad</div>
                <div className="h-24">
                   <textarea className="w-full h-full p-2 resize-none outline-none focus:bg-blue-50 focus:ring-1 focus:ring-blue-200" value={job.profile.knowledge} onChange={e => updateProfile('knowledge', e.target.value)} disabled={isReadOnly} />
                </div>
             </div>

             {/* Languages */}
             <div className="grid grid-cols-2 border-b border-gray-800">
               <div className="border-r border-gray-800 flex items-center p-2 gap-2">
                 <span className="font-bold">IDIOMA INGLÉS</span>
                 <input type="number" className="border border-gray-400 w-16 p-1 text-center" value={job.profile.englishPercentage} onChange={e => updateProfile('englishPercentage', parseInt(e.target.value))} disabled={isReadOnly} />
                 <span>%</span>
               </div>
               <div className="flex items-center p-2 gap-2">
                 <span className="font-bold">OTRO IDIOMA</span>
                 <input className="border border-gray-400 w-24 p-1" placeholder="Idioma" value={job.profile.otherLanguage} onChange={e => updateProfile('otherLanguage', e.target.value)} disabled={isReadOnly} />
                 <input type="number" className="border border-gray-400 w-16 p-1 text-center" value={job.profile.otherLanguagePercentage} onChange={e => updateProfile('otherLanguagePercentage', parseInt(e.target.value))} disabled={isReadOnly} />
                 <span>%</span>
               </div>
             </div>

             {/* Experience */}
             <div>
               <div className="flex items-center justify-center gap-4 bg-gray-200 border-b border-gray-800 p-2 font-bold">
                 REQUIERE EXPERIENCIA LABORAL
                 <label className="flex items-center gap-1 cursor-pointer">SI <input type="checkbox" checked={job.profile.experienceRequired} onChange={() => updateProfile('experienceRequired', true)} disabled={isReadOnly} /></label>
                 <label className="flex items-center gap-1 cursor-pointer">NO <input type="checkbox" checked={!job.profile.experienceRequired} onChange={() => updateProfile('experienceRequired', false)} disabled={isReadOnly} /></label>
               </div>
               <div className="grid grid-cols-[2fr_1fr_1fr_1fr]">
                  <div className="bg-gray-100 text-center text-xs font-bold border-r border-b border-gray-800 p-2">Áreas y/o Funciones</div>
                  <div className="bg-gray-100 text-center text-xs font-bold border-r border-b border-gray-800 p-2">Nivel</div>
                  <div className="bg-gray-100 text-center text-xs font-bold border-r border-b border-gray-800 p-2">Años</div>
                  <div className="bg-gray-100 text-center text-xs font-bold border-b border-gray-800 p-2">Otros</div>
                  
                  {job.profile.experienceAreas.map((exp, i) => (
                    <React.Fragment key={exp.id}>
                       <div className="border-r border-b border-gray-800 last:border-b-0 h-10">
                         <InputCell disabled={isReadOnly} value={exp.area} onChange={(v: string) => {
                            const newExp = [...job.profile.experienceAreas];
                            newExp[i].area = v;
                            setJob({...job, profile: {...job.profile, experienceAreas: newExp}});
                         }} />
                       </div>
                       <div className="border-r border-b border-gray-800 last:border-b-0">
                         <InputCell disabled={isReadOnly} value={exp.level} onChange={(v: string) => {
                            const newExp = [...job.profile.experienceAreas];
                            newExp[i].level = v;
                            setJob({...job, profile: {...job.profile, experienceAreas: newExp}});
                         }} />
                       </div>
                       <div className="border-r border-b border-gray-800 last:border-b-0">
                         <InputCell disabled={isReadOnly} value={exp.years} onChange={(v: string) => {
                            const newExp = [...job.profile.experienceAreas];
                            newExp[i].years = v;
                            setJob({...job, profile: {...job.profile, experienceAreas: newExp}});
                         }} />
                       </div>
                       <div className="border-b border-gray-800 last:border-b-0">
                         <InputCell disabled={isReadOnly} value={exp.other} onChange={(v: string) => {
                            const newExp = [...job.profile.experienceAreas];
                            newExp[i].other = v;
                            setJob({...job, profile: {...job.profile, experienceAreas: newExp}});
                         }} />
                       </div>
                    </React.Fragment>
                  ))}
               </div>
             </div>
          </div>

        </div>
        
        {/* Footer actions for Web View */}
        <div className="no-print mt-8 bg-gray-50 p-4 border-t flex justify-end gap-4 rounded-b-lg">
             {job.status === WorkflowStatus.DRAFT && (
               <button onClick={() => setJob({...job, status: WorkflowStatus.VALIDATION})} className="bg-blue-600 text-white px-6 py-2 rounded">
                 Enviar a Validación
               </button>
             )}
             {job.status === WorkflowStatus.VALIDATION && (
               <>
                 <button onClick={() => setJob({...job, status: WorkflowStatus.DRAFT})} className="bg-red-500 text-white px-6 py-2 rounded">
                   Rechazar
                 </button>
                 <button onClick={() => setJob({...job, status: WorkflowStatus.APPROVED})} className="bg-green-600 text-white px-6 py-2 rounded">
                   Aprobar (RH)
                 </button>
               </>
             )}
        </div>
      </div>

      {/* Wizards */}
      {isWizardOpen && (
        <ResponsibilityWizard 
          level={job.level}
          sequence={job.responsibilities.length + 1}
          existingResp={editingResp}
          onSave={handleSaveResponsibility}
          onCancel={() => setIsWizardOpen(false)}
        />
      )}
    </div>
  );
}