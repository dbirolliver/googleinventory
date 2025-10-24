// FIX: Add a TypeScript declaration for `ImportMetaEnv` to correctly type `import.meta.env.VITE_API_KEY`.
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    readonly VITE_API_KEY?: string;
    // add other environment variables here if needed
  }
}

import { GoogleGenAI, Type } from "@google/genai";
import type { Product, PredictionResult, Branch, Supplier, InventoryItem, PricePredictionResult } from '../types';
import { Urgency } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY as string });

export const getRestockPredictions = async (products: Product[], branches: Branch[], suppliers: Supplier[]): Promise<PredictionResult[]> => {
  const model = "gemini-2.5-pro";

  const branchDataString = branches.map(b => `{ id: "${b.id}", name: "${b.name}" }`).join('\n');
  const supplierDataString = suppliers.map(s => `{ id: "${s.id}", name: "${s.name}" }`).join('\n');
  const productDataString = products.map(p => {
    const stockLevels = p.stockLevels.map(sl => {
        const batches = sl.batches.map(b => {
            const expiryPart = b.expiryDate ? `, expiryDate: "${b.expiryDate}"` : '';
            return `{ quantity: ${b.quantity}${expiryPart} }`
        }).join(', ');
        return `{ branchId: "${sl.branchId}", batches: [${batches}] }`;
    }).join(', ');
    
    const usage = p.historicalUsage.map(hs => {
        const totalUsage = hs.usage.reduce((a, b) => a + b, 0);
        return `{ branchId: "${hs.branchId}", last7DaysUsageTotal: ${totalUsage} }`;
    }).join(', ');

    return `{ id: "${p.id}", name: "${p.name}", supplierId: "${p.supplierId}", minStockLevel: ${p.minStockLevel || 0}, stockLevels: [${stockLevels}], usageSummary: [${usage}] }`;
  }).join('\n');

  const prompt = `
    You are an expert dental clinic inventory analyst for "Premierlux Dental Clinic", a multi-location practice.
    Your task is to predict restocking needs for essential dental supplies for the next 30 days based on the provided data. The inventory system uses batch tracking, meaning a single product at one clinic can have multiple batches, each with its own quantity and expiry date.

    First, here is the context for the clinic structure:
    Clinics:
    ${branchDataString}

    Suppliers:
    ${supplierDataString}

    Now, analyze the following dental supply data. Each item has current stock levels broken down by batch, a usage summary from the last 7 days, and a 'minStockLevel' which applies to the total stock of a product at a clinic.
    The 'minStockLevel' is the safety stock threshold. If a clinic's total stock for a product is at or below this level, it is a high-priority situation.
    Crucially, analyze the 'batches' for each product. Dental supplies expiring soon (e.g., within the next 30-60 days from today, ${new Date().toISOString().split('T')[0]}) are a top priority. Your suggestions must reflect this. Flag batches for immediate use, suggest potential transfers of soon-to-expire stock to higher-usage clinics, and avoid suggesting restocking items at a location where a batch is about to expire. Use the 'last7DaysUsageTotal' to project future demand.

    Dental Supply Data:
    ${productDataString}

    For each product, provide the following in a JSON array format:
    1.  **productId**: The unique identifier for the product.
    2.  **predictedUsage**: An aggregated numerical prediction for total usage across all clinics in the next 30 days.
    3.  **restockSuggestion**: A concise, high-level action for the product overall. e.g., "Restock 20 boxes total", "Transfer batch expiring soon from Downtown to Westside", "Prioritize using the 8 units expiring in 25 days at Westside".
    4.  **urgency**: A category for the urgency of restocking. It must be one of: 'Low', 'Medium', 'High'.
        - 'High': Total stock in any clinic is at or below its 'minStockLevel' OR a batch is nearing its expiry date OR stock is likely to run out in a high-traffic clinic within 30 days.
        - 'Medium': Overall stock might be low towards the end of the 30-day period.
        - 'Low': Stock levels are sufficient.
    5.  **branchSuggestions**: An array of objects, each specifying a branchId and the recommended restockAmount for that specific clinic to optimize inventory levels. Only include clinics that require action. The restockAmount should aim to bring total stock comfortably above the minStockLevel, considering predicted usage. Do not suggest restocking clinics where stock is about to expire.
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        productId: { type: Type.STRING },
        predictedUsage: { type: Type.INTEGER },
        restockSuggestion: { type: Type.STRING },
        urgency: { type: Type.STRING, enum: [Urgency.LOW, Urgency.MEDIUM, Urgency.HIGH] },
        branchSuggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    branchId: { type: Type.STRING },
                    restockAmount: { type: Type.INTEGER }
                },
                required: ["branchId", "restockAmount"]
            }
        }
      },
      required: ["productId", "predictedUsage", "restockSuggestion", "urgency"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as PredictionResult[];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get predictions from Gemini API.");
  }
};

export const getSupplierPricePrediction = async (supplier: Supplier, products: Product[]): Promise<PricePredictionResult[]> => {
    const model = "gemini-2.5-pro";

    const productDataString = products.map(p => {
        const prices = p.historicalPrices.map(hp => `{ date: "${hp.date}", price: ${hp.price} }`).join(', ');
        return `{ id: "${p.id}", name: "${p.name}", historicalPrices: [${prices}] }`;
    }).join('\n');

    const prompt = `
        You are a supply chain and pricing analyst for the dental industry. Your task is to predict future price changes for dental supplies from a specific supplier based on historical data.
        Analyze the historical price data for each product from the supplier "${supplier.name}". Consider trends, seasonality (if discernible), and dental market factors.

        Product Data from ${supplier.name}:
        ${productDataString}

        For each product, provide a prediction for the next 3-6 months in a JSON array format:
        1. **productId**: The unique identifier for the product.
        2. **productName**: The name of the product.
        3. **predictionSummary**: A concise, human-readable summary of the predicted price change. For example: "Price expected to increase moderately in the next quarter due to material costs." or "Price likely to remain stable."
        4. **predictedChangePercentage**: A numerical estimate of the price change percentage. Use a positive number for an increase (e.g., 5.5 for +5.5%), a negative number for a decrease (e.g., -2.0 for -2.0%), and 0 for no significant change.
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                productId: { type: Type.STRING },
                productName: { type: Type.STRING },
                predictionSummary: { type: Type.STRING },
                predictedChangePercentage: { type: Type.NUMBER }
            },
            required: ["productId", "productName", "predictionSummary", "predictedChangePercentage"]
        }
    };
    
    try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.3
          }
        });
    
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PricePredictionResult[];
    
      } catch (error)
      {
        console.error("Error calling Gemini API for price prediction:", error);
        throw new Error("Failed to get price predictions from Gemini API.");
      }
}

export const getChatbotResponse = async (
  query: string,
  inventory: InventoryItem[],
  suppliers: Supplier[],
  branches: Branch[]
): Promise<string> => {
  const model = "gemini-2.5-flash";

  const context = {
    branches,
    suppliers,
    inventory: inventory.map(item => ({
      id: item.id,
      name: item.name,
      supplierId: item.supplierId,
      totalStock: item.totalStock,
      predictedUsage: item.predictedUsage,
      urgency: item.urgency,
      stockLevels: item.stockLevels.map(sl => ({
          branchId: sl.branchId,
          totalQuantity: sl.batches.reduce((sum, b) => sum + b.quantity, 0),
          batches: sl.batches.map(b => ({ quantity: b.quantity, expiryDate: b.expiryDate }))
      }))
    }))
  };

  const prompt = `
    You are an AI assistant for the "Premierlux Dental Clinic" inventory management system. Your name is "Invo".
    You must answer questions about dental supplies based ONLY on the data context provided below. The inventory has multiple batches for each item, so be specific about quantities and expiry dates if asked.
    Be friendly, concise, and professional. If you don't know the answer from the context, say "I don't have that information in the current data."
    Do not make up information.
    
    Current Date: ${new Date().toLocaleDateString()}
    
    DATA CONTEXT:
    ${JSON.stringify(context, null, 2)}

    USER QUESTION:
    "${query}"

    YOUR ANSWER:
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for chatbot:", error);
    throw new Error("Failed to get response from the AI assistant.");
  }
};