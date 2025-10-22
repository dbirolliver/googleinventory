
import { GoogleGenAI, Type } from "@google/genai";
import type { Product, PredictionResult, Branch, Supplier, InventoryItem, PricePredictionResult } from '../types';
import { Urgency } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getRestockPredictions = async (products: Product[], branches: Branch[], suppliers: Supplier[]): Promise<PredictionResult[]> => {
  const model = "gemini-2.5-pro";

  const branchDataString = branches.map(b => `{ id: "${b.id}", name: "${b.name}" }`).join('\n');
  const supplierDataString = suppliers.map(s => `{ id: "${s.id}", name: "${s.name}" }`).join('\n');
  const productDataString = products.map(p => {
    const stockLevels = p.stockLevels.map(sl => {
        const expiryPart = sl.expiryDate ? `, expiryDate: "${sl.expiryDate}"` : '';
        return `{ branchId: "${sl.branchId}", quantity: ${sl.quantity}${expiryPart} }`;
    }).join(', ');
    
    const sales = p.historicalSales.map(hs => {
        const totalSales = hs.sales.reduce((a, b) => a + b, 0);
        return `{ branchId: "${hs.branchId}", last7DaysSalesTotal: ${totalSales} }`;
    }).join(', ');

    return `{ id: "${p.id}", name: "${p.name}", supplierId: "${p.supplierId}", minStockLevel: ${p.minStockLevel || 0}, stockLevels: [${stockLevels}], salesSummary: [${sales}] }`;
  }).join('\n');

  const prompt = `
    You are an expert inventory management analyst for a multi-location e-commerce store.
    Your task is to predict restocking needs for the next 30 days based on the provided data.

    First, here is the context for the business structure:
    Branches:
    ${branchDataString}

    Suppliers:
    ${supplierDataString}

    Now, analyze the following product data. Each product has current stock levels (which may include an expiry date), a sales summary from the last 7 days, and a critical 'minStockLevel'.
    The 'minStockLevel' is the safety stock threshold. If a branch's stock is at or below this level, it is a high-priority situation.
    Crucially, also consider the 'expiryDate'. Items expiring soon (e.g., within the next 30-60 days from today, ${new Date().toISOString().split('T')[0]}) should be flagged for potential transfers or promotions, and you should avoid suggesting restocking items that are about to expire. Use the 'last7DaysSalesTotal' to project future demand.

    Product Data:
    ${productDataString}

    For each product, provide the following in a JSON array format:
    1.  **productId**: The unique identifier for the product.
    2.  **predictedSales**: An aggregated numerical prediction for total sales across all branches in the next 30 days.
    3.  **restockSuggestion**: A concise, high-level action for the product overall. e.g., "Restock 150 units total", "Transfer stock from Downtown to Westside", "Prioritize selling stock nearing expiry".
    4.  **urgency**: A category for the urgency of restocking. It must be one of: 'Low', 'Medium', 'High'.
        - 'High': Stock in any branch is at or below its 'minStockLevel' OR is likely to run out in a high-traffic branch within 30 days OR has stock nearing its expiry date.
        - 'Medium': Overall stock might be low towards the end of the 30-day period.
        - 'Low': Stock levels are sufficient.
    5.  **branchSuggestions**: An array of objects, each specifying a branchId and the recommended restockAmount for that specific branch to optimize inventory levels. Only include branches that require action. The restockAmount should aim to bring stock comfortably above the minStockLevel, considering predicted sales. Do not suggest restocking branches where stock is about to expire.
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        productId: { type: Type.STRING },
        predictedSales: { type: Type.INTEGER },
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
      required: ["productId", "predictedSales", "restockSuggestion", "urgency"]
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
        You are a supply chain and pricing analyst. Your task is to predict future price changes for products from a specific supplier based on historical data.
        Analyze the historical price data for each product from the supplier "${supplier.name}". Consider trends, seasonality (if discernible), and market factors.

        Product Data from ${supplier.name}:
        ${productDataString}

        For each product, provide a prediction for the next 3-6 months in a JSON array format:
        1. **productId**: The unique identifier for the product.
        2. **productName**: The name of the product.
        3. **predictionSummary**: A concise, human-readable summary of the predicted price change. For example: "Price expected to increase moderately in the next quarter due to seasonal demand." or "Price likely to remain stable."
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
      predictedSales: item.predictedSales,
      urgency: item.urgency,
      stockLevels: item.stockLevels
    }))
  };

  const prompt = `
    You are an AI assistant for a supplies management system. Your name is "Invo".
    You must answer questions based ONLY on the data context provided below.
    Be friendly, concise, and helpful. If you don't know the answer from the context, say "I don't have that information in the current data."
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
