import { HierarchyLevel, Verb } from './types';

export const INITIAL_VERBS: Verb[] = [
  { 
    id: '1', 
    text: 'Analizar', 
    type: 'Recomendado', 
    levels: [HierarchyLevel.TACTICAL, HierarchyLevel.OPERATIONAL],
    description: 'Estudiar o examinar situaciones o problemas.'
  },
  { 
    id: '2', 
    text: 'Aprobar', 
    type: 'Recomendado', 
    levels: [HierarchyLevel.STRATEGIC, HierarchyLevel.TACTICAL],
    description: 'Dar la conformidad a algo hecho o para que se haga algo.'
  },
  { 
    id: '3', 
    text: 'Dirigir', 
    type: 'Recomendado', 
    levels: [HierarchyLevel.STRATEGIC],
    description: 'Ordenar la actuación y definir el uso de recursos, responsabilizándose de los resultados.'
  },
  { 
    id: '4', 
    text: 'Coordinar', 
    type: 'Recomendado', 
    levels: [HierarchyLevel.TACTICAL, HierarchyLevel.OPERATIONAL],
    description: 'Disponer ordenadamente la utilización de medios y recursos diferentes.'
  },
  { 
    id: '5', 
    text: 'Planificar', 
    type: 'Recomendado', 
    levels: [HierarchyLevel.STRATEGIC],
    description: 'Establecer la secuencia de desarrollo de conjuntos de acciones a medio o largo plazo.'
  },
  { 
    id: '6', 
    text: 'Supervisar', 
    type: 'Recomendado', 
    levels: [HierarchyLevel.TACTICAL, HierarchyLevel.OPERATIONAL],
    description: 'Controlar la ejecución de un modo cercano a la actividad.'
  },
  { 
    id: '7', 
    text: 'Administrar', 
    type: 'Recomendado', 
    levels: [HierarchyLevel.STRATEGIC, HierarchyLevel.TACTICAL],
    description: 'Gestionar recursos y programas.'
  },
  { 
    id: '8', 
    text: 'Establecer', 
    type: 'Recomendado', 
    levels: [HierarchyLevel.STRATEGIC, HierarchyLevel.TACTICAL],
    description: 'Fijar condiciones.'
  },
  { 
    id: '9', 
    text: 'Ejecutar', 
    type: 'Recomendado', 
    levels: [HierarchyLevel.TACTICAL, HierarchyLevel.OPERATIONAL],
    description: 'Realizar, procesar, llevar a cabo tareas específicas.'
  },
  { 
    id: '10', 
    text: 'Registrar', 
    type: 'Recomendado', 
    levels: [HierarchyLevel.OPERATIONAL],
    description: 'Anotar e inscribir.'
  },
  // Not Recommended Verbs - Level is technically N/A, but we map them to all to ensure they trigger the warning
  { 
    id: '11', 
    text: 'Asistir', 
    type: 'NO Recomendado', 
    levels: [HierarchyLevel.STRATEGIC, HierarchyLevel.TACTICAL, HierarchyLevel.OPERATIONAL],
    clarification: 'Debe inclinarse a la materia sobre la que se asiste y la repercusión de los resultados. Se sugiere un verbo más activo.'
  },
  { 
    id: '12', 
    text: 'Colaborar', 
    type: 'NO Recomendado', 
    levels: [HierarchyLevel.STRATEGIC, HierarchyLevel.TACTICAL, HierarchyLevel.OPERATIONAL],
    clarification: 'Indicar tipo de colaboración e incidencia en los resultados.'
  },
  { 
    id: '13', 
    text: 'Gestionar', 
    type: 'NO Recomendado', 
    levels: [HierarchyLevel.STRATEGIC, HierarchyLevel.TACTICAL, HierarchyLevel.OPERATIONAL],
    clarification: 'Reflejar de forma que no haya dudas la acepción, indicar el fin y la incidencia en los resultados.'
  },
  { 
    id: '14', 
    text: 'Participar', 
    type: 'NO Recomendado', 
    levels: [HierarchyLevel.STRATEGIC, HierarchyLevel.TACTICAL, HierarchyLevel.OPERATIONAL],
    clarification: 'Indicar tipo de participación e incidencia en los resultados finales.'
  }
];