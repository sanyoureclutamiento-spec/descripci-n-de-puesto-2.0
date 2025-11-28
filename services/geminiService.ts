import { GoogleGenAI } from "@google/genai";
import { JobDescription } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const checkConsistency = async (job: JobDescription): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing");
    return "No se pudo conectar con el Asistente de Plan Organizacional para la validación avanzada (Falta API Key).";
  }

  const responsibilitiesText = job.responsibilities
    .map(r => `- ${r.action1} ${r.object} para ${r.result}`)
    .join('\n');

  const missionText = `${job.missionGuide} ${job.missionResult}, ${job.missionAction} ${job.missionObject}`;

  const prompt = `
    Actúa como un Consultor Senior experto en Metodología de Plan Organizacional y Diseño Organizacional. 
    Analiza la siguiente descripción de puesto y detecta incoherencias estructurales o de nivel.
    
    INFORMACIÓN DEL PUESTO:
    Título: ${job.title}
    Nivel Jerárquico Declarado: ${job.level}
    Misión: ${missionText}
    
    DIMENSIONES:
    - Personal: ${job.totalPersonnel} (Directos: ${job.subordinatesDirect})
    - Presupuesto Op: ${job.budgetOperating}
    - Alcance: ${job.managementScope}
    
    RESPONSABILIDADES:
    ${responsibilitiesText}

    PERFIL REQUERIDO:
    - Escolaridad: ${job.profile.education}
    - Experiencia: ${job.profile.experienceRequired ? 'Sí' : 'No'}

    REGLAS DE VALIDACIÓN:
    1. COHERENCIA DE NIVEL: Si es Operacional, no debe tener verbos como 'Dirigir' o 'Planificar Estrategia', ni presupuestos masivos. Si es Estratégico, la misión debe ser de impacto amplio.
    2. ESTRUCTURA DE RESPONSABILIDADES: Verifica que sigan la estructura QUÉ + CÓMO + PARA QUÉ.
    3. ALINEACIÓN PERFIL-PUESTO: Si el puesto es de alto nivel, la escolaridad y experiencia deben ser acordes.

    Responde brevemente (máximo 100 palabras) con un tono profesional y constructivo. 
    Si todo parece correcto, indica: "La descripción es consistente y sólida."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con el servicio de validación inteligente.";
  }
};