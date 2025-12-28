
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectData } from "../types";

const SECTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    content: { type: Type.STRING },
    subsections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["title", "content"]
      }
    }
  },
  required: ["title", "content"]
};

export const generateDocsContent = async (project: ProjectData) => {
  // Always initialize GoogleGenAI with a named parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a Senior Software Architect. Generate the full content for a Software Requirements Specification (SRS) and a Software Design Document (SDD) for a project titled "${project.title}".
    
    The university is "The Islamia University of Bahawalpur", Department of Artificial Intelligence.
    
    SRS STRUCTURE:
    1. Introduction (Purpose, Scope - use "The system shall..." language)
    2. Overall Description (Product Perspective, Operating Environment, Design Constraints)
    3. Requirement Identifying Technique (Describe Use Cases for this project)
    4. Functional Requirements (List at least 5 major functional requirements)
    5. Non-Functional Requirements (Usability, Performance)
    6. References
    
    SDD STRUCTURE:
    1. Introduction (Scope and Modules)
    2. Design Methodology (Explain OOP vs Procedural)
    3. System Overview (Architectural Design)
    4. System Architecture Graph Description (Provide a detailed text-based flowchart representation of the system modules and how they interact)
    5. Design Models (Describe Class Diagram components, Sequence flows)
    6. Data Design (Detailed Data Dictionary)
    7. Algorithm & Implementation (Summarize key logic)
    8. Human Interface Design (Describe screen layouts)
    
    Formatting Rules:
    - SRS must use "The system shall..."
    - SDD must be highly technical.
    - IMPORTANT: For the "System Architecture Graph Description", create a structured ASCII-style or list-based flowchart representation that can be rendered in a document.
    
    Return the response strictly as a JSON object with keys "srs" and "sdd".
  `;

  // Use 'gemini-3-pro-preview' for complex reasoning and technical document generation
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          srs: { type: Type.ARRAY, items: SECTION_SCHEMA },
          sdd: { type: Type.ARRAY, items: SECTION_SCHEMA }
        },
        required: ["srs", "sdd"]
      }
    }
  });

  // Access the extracted string directly via the .text property
  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr);
};
