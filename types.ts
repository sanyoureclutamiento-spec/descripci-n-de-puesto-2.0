
export enum HierarchyLevel {
  STRATEGIC = 'Estratégico',
  TACTICAL = 'Táctico',
  OPERATIONAL = 'Operacional'
}

export enum WorkflowStatus {
  DRAFT = 'Elaboración',
  VALIDATION = 'Validación (Jefe)',
  APPROVED = 'Aprobado (RH)'
}

export interface Verb {
  id: string;
  text: string;
  type: 'Recomendado' | 'NO Recomendado';
  levels: HierarchyLevel[];
  clarification?: string;
  description?: string;
}

export interface Responsibility {
  id: string;
  sequence: number;
  action1: string; // Què (Verbo 1)
  action2?: string; // Què (Verbo 2)
  object: string; // Còmo (Objeto/Medio)
  result: string; // Para què (Resultado)
}

export interface Relationship {
  id: string;
  entity: string; // Puesto/Área or Institución
  purpose: string; // Para qué
}

export interface Challenge {
  id: string;
  situation: string;
}

export interface Decision {
  id: string;
  description: string;
}

export interface JobProfile {
  travel: boolean;
  travelFrequency?: 'Ocasionalmente' | 'Frecuentemente';
  education: string;
  educationArea: string;
  knowledge: string;
  englishPercentage: number;
  otherLanguage: string;
  otherLanguagePercentage: number;
  experienceRequired: boolean;
  experienceAreas: { id: string; area: string; level: string; years: string; other: string }[];
}

export interface OrgChart {
  managerOfManager: string;
  manager: string;
  peers: string[]; // Nombres de puestos que reportan al mismo jefe (multiline string for simplicity in UI)
  subordinates: string[]; // Nombres de puestos subordinados (array for boxes)
}

export interface JobDescription {
  id: string;
  
  // 1. Identificación
  title: string;
  reportsTo: string;
  area: string;
  department: string;
  location: string;
  level: HierarchyLevel; // Internal use for logic, might not be printed directly but affects validation

  // 2. Aprobaciones
  occupantName: string;
  occupantDate: string;
  managerName: string;
  managerDate: string;
  hrName: string;
  hrDate: string;
  
  // 3. Misión (Computed from tokens or manual override)
  missionGuide: string;
  missionResult: string;
  missionAction: string;
  missionObject: string;

  // 4. Funciones (Max 8)
  responsibilities: Responsibility[];
  
  // 5. Relaciones Internas (Max 4)
  internalRelations: Relationship[];

  // 6. Relaciones Externas (Max 4)
  externalRelations: Relationship[];

  // 7. Dimensiones
  subordinatesDirect: string;
  subordinatesIndirect: string;
  totalPersonnel: string;
  budgetOperating: string;
  budgetIncome: string;
  managementScope: 'Nacional' | 'Internacional' | '';
  otherIndicators: string;

  // 8. Retos (Max 2)
  challenges: Challenge[];

  // 9. Decisiones (Max 2)
  decisions: Decision[];

  // 10. Organigrama
  orgChart: OrgChart;

  // 11. Perfil
  profile: JobProfile;

  // Metadata
  status: WorkflowStatus;
  version: number;
  comments: string; 
}