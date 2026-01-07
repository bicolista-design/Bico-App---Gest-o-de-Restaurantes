
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (productName: string) => {
  if (!process.env.API_KEY) return "Descrição automática não disponível (Sem API Key).";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escreva uma descrição curta e apetitosa em português para um item de menu chamado: ${productName}`,
    });
    return response.text || "Sem descrição disponível.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao gerar descrição.";
  }
};

export const analyzeDailyPerformance = async (salesData: any) => {
  if (!process.env.API_KEY) return "Análise não disponível.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Aja como um consultor de restaurantes experiente. Analise os seguintes dados de vendas de hoje e forneça 3 dicas práticas para aumentar o lucro ou melhorar o atendimento: ${JSON.stringify(salesData)}. Retorne em português, de forma direta e motivadora.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini BI Error:", error);
    return "Erro ao analisar performance.";
  }
};
