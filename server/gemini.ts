import { GoogleGenAI } from "@google/genai";
import type { Vendor } from "@shared/schema";

// Gemini AI integration for EventMate
// Uses gemini-2.5-flash for fast recommendations

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Helper to format vendor data for AI context
function formatVendorsForAI(vendors: Vendor[]): string {
  if (!vendors || vendors.length === 0) {
    return "No vendors available in the system.";
  }
  
  const groupedVendors: Record<string, Vendor[]> = {};
  vendors.forEach(v => {
    if (!groupedVendors[v.category]) {
      groupedVendors[v.category] = [];
    }
    groupedVendors[v.category].push(v);
  });
  
  let vendorList = "AVAILABLE VENDORS IN OUR PLATFORM:\n";
  for (const [category, categoryVendors] of Object.entries(groupedVendors)) {
    vendorList += `\n${category.toUpperCase()}:\n`;
    categoryVendors.forEach(v => {
      const priceRange = v.priceRange as { min?: number; max?: number } | null;
      const priceStr = priceRange 
        ? `Rs. ${priceRange.min?.toLocaleString('en-IN')} - Rs. ${priceRange.max?.toLocaleString('en-IN')}`
        : "Contact for pricing";
      vendorList += `  - ${v.businessName} (ID: ${v.id})
    Location: ${v.location || 'Not specified'}
    Rating: ${v.rating}/5 (${v.reviewCount} reviews)
    Price Range: ${priceStr}
    ${v.isVerified ? '(Verified Vendor)' : ''}
`;
    });
  }
  return vendorList;
}

export interface VendorRecommendation {
  category: string;
  name: string;
  vendorId?: string | null;
  description: string;
  estimatedCost: number;
  priority: string;
  reason: string;
}

export interface EventSchedule {
  phase: string;
  tasks: {
    title: string;
    description: string;
    daysBeforeEvent: number;
    category: string;
    estimatedDuration: string;
  }[];
}

export interface BudgetBreakdown {
  category: string;
  percentage: number;
  estimatedAmount: number;
  tips: string;
}

export interface AIRecommendationResponse {
  vendorRecommendations: VendorRecommendation[];
  schedule: EventSchedule[];
  budgetBreakdown: BudgetBreakdown[];
  tips: string[];
}

export async function getEventRecommendations(
  eventType: string,
  budget: number,
  guestCount: number,
  location: string,
  date: string,
  theme?: string,
  availableVendors?: Vendor[]
): Promise<AIRecommendationResponse> {
  const vendorContext = availableVendors && availableVendors.length > 0 
    ? formatVendorsForAI(availableVendors)
    : "";

  const prompt = `You are an expert event planner for EventMate, an Indian event planning platform. Generate comprehensive recommendations for the following event:

Event Type: ${eventType}
Budget: Rs. ${budget.toLocaleString('en-IN')} (Indian Rupees)
Guest Count: ${guestCount}
Location: ${location}
Date: ${date}
${theme ? `Theme: ${theme}` : ''}

${vendorContext ? `
IMPORTANT: You MUST recommend vendors from the following list of available vendors on our platform. 
Only recommend vendors that exist in this list. Use their exact business names.

${vendorContext}
` : ''}

Please provide a JSON response with the following structure:
{
  "vendorRecommendations": [
    {
      "category": "venue|catering|decoration|photography|entertainment|florist|cake|transport",
      "name": "Exact business name from available vendors list OR general vendor type if no match",
      "vendorId": "ID from the vendors list if recommending a specific vendor, null otherwise",
      "description": "Brief description of what they offer or what to look for",
      "estimatedCost": number (in Indian Rupees),
      "priority": "essential|recommended|optional",
      "reason": "Why this vendor/category is recommended for this event"
    }
  ],
  "schedule": [
    {
      "phase": "Planning Phase Name",
      "tasks": [
        {
          "title": "Task name",
          "description": "Task description",
          "daysBeforeEvent": number,
          "category": "planning|booking|coordination|setup",
          "estimatedDuration": "e.g., 2 hours"
        }
      ]
    }
  ],
  "budgetBreakdown": [
    {
      "category": "Category name",
      "percentage": number (0-100),
      "estimatedAmount": number (in Indian Rupees),
      "tips": "Budget optimization tip"
    }
  ],
  "tips": ["General planning tips for this event type in India"]
}

IMPORTANT: 
- All costs should be in Indian Rupees (Rs.)
- If vendors are available on the platform, PRIORITIZE recommending them by name
- Ensure the total budget breakdown adds up to 100% and estimated costs align with the provided budget
- Provide at least 5 vendor recommendations, 3 schedule phases with multiple tasks each, and 5 budget categories
- Consider Indian wedding/event customs and preferences`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson) as AIRecommendationResponse;
    }
    throw new Error("Empty response from Gemini");
  } catch (error) {
    console.error("Gemini API error:", error);
    // Return default recommendations if AI fails
    return getDefaultRecommendations(eventType, budget, guestCount);
  }
}

export async function getVendorSuggestions(
  category: string,
  budget: number,
  eventType: string,
  guestCount: number
): Promise<{ suggestions: string[]; tips: string[] }> {
  const prompt = `As an event planning expert, provide specific vendor selection tips for:
Category: ${category}
Budget for this category: $${budget}
Event Type: ${eventType}
Guest Count: ${guestCount}

Return JSON with:
{
  "suggestions": ["5 specific things to look for when selecting a ${category} vendor"],
  "tips": ["3 cost-saving tips for ${category}"]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Gemini vendor suggestions error:", error);
    return {
      suggestions: [
        "Check reviews and ratings",
        "Ask for references from previous clients",
        "Compare at least 3 different vendors",
        "Review their portfolio",
        "Confirm availability for your date"
      ],
      tips: [
        "Book during off-peak season for better rates",
        "Bundle services for discounts",
        "Negotiate package deals"
      ]
    };
  }
}

function getDefaultRecommendations(
  eventType: string,
  budget: number,
  guestCount: number
): AIRecommendationResponse {
  const venuePercent = 0.35;
  const cateringPercent = 0.30;
  const decorPercent = 0.10;
  const photoPercent = 0.10;
  const entertainPercent = 0.10;
  const miscPercent = 0.05;

  return {
    vendorRecommendations: [
      {
        category: "venue",
        name: "Event Venue",
        description: `A suitable venue for ${guestCount} guests for your ${eventType}`,
        estimatedCost: Math.round(budget * venuePercent),
        priority: "essential",
        reason: "The foundation of your event experience"
      },
      {
        category: "catering",
        name: "Catering Service",
        description: "Full-service catering with appetizers, main course, and desserts",
        estimatedCost: Math.round(budget * cateringPercent),
        priority: "essential",
        reason: "Quality food is key to guest satisfaction"
      },
      {
        category: "decoration",
        name: "Event Decorator",
        description: "Professional decoration and styling services",
        estimatedCost: Math.round(budget * decorPercent),
        priority: "recommended",
        reason: "Creates the atmosphere and visual impact"
      },
      {
        category: "photography",
        name: "Professional Photographer",
        description: "Event photography and videography services",
        estimatedCost: Math.round(budget * photoPercent),
        priority: "recommended",
        reason: "Captures precious memories"
      },
      {
        category: "entertainment",
        name: "Entertainment",
        description: "Music, DJ, or live entertainment",
        estimatedCost: Math.round(budget * entertainPercent),
        priority: "recommended",
        reason: "Keeps guests engaged and entertained"
      }
    ],
    schedule: [
      {
        phase: "Initial Planning",
        tasks: [
          { title: "Set budget and guest list", description: "Finalize your budget and create initial guest list", daysBeforeEvent: 90, category: "planning", estimatedDuration: "2-3 hours" },
          { title: "Book venue", description: "Visit and book your preferred venue", daysBeforeEvent: 75, category: "booking", estimatedDuration: "1 day" },
          { title: "Hire caterer", description: "Select and book catering service", daysBeforeEvent: 60, category: "booking", estimatedDuration: "1 day" }
        ]
      },
      {
        phase: "Vendor Coordination",
        tasks: [
          { title: "Book photographer", description: "Hire professional photographer/videographer", daysBeforeEvent: 45, category: "booking", estimatedDuration: "2 hours" },
          { title: "Arrange decorations", description: "Finalize decoration theme and book decorator", daysBeforeEvent: 40, category: "booking", estimatedDuration: "3 hours" },
          { title: "Book entertainment", description: "Arrange music/DJ or live entertainment", daysBeforeEvent: 35, category: "booking", estimatedDuration: "2 hours" }
        ]
      },
      {
        phase: "Final Preparations",
        tasks: [
          { title: "Final guest count", description: "Confirm final guest count with caterer", daysBeforeEvent: 14, category: "coordination", estimatedDuration: "1 hour" },
          { title: "Vendor confirmations", description: "Confirm all vendors and timings", daysBeforeEvent: 7, category: "coordination", estimatedDuration: "2 hours" },
          { title: "Day-before setup", description: "Coordinate setup with venue and decorators", daysBeforeEvent: 1, category: "setup", estimatedDuration: "4 hours" }
        ]
      }
    ],
    budgetBreakdown: [
      { category: "Venue", percentage: 35, estimatedAmount: Math.round(budget * 0.35), tips: "Consider off-peak dates for savings" },
      { category: "Catering", percentage: 30, estimatedAmount: Math.round(budget * 0.30), tips: "Buffet style can be more cost-effective" },
      { category: "Decoration", percentage: 10, estimatedAmount: Math.round(budget * 0.10), tips: "Rent items instead of buying" },
      { category: "Photography", percentage: 10, estimatedAmount: Math.round(budget * 0.10), tips: "Book for specific hours, not full day" },
      { category: "Entertainment", percentage: 10, estimatedAmount: Math.round(budget * 0.10), tips: "Consider local talent for better rates" },
      { category: "Miscellaneous", percentage: 5, estimatedAmount: Math.round(budget * 0.05), tips: "Always keep a contingency fund" }
    ],
    tips: [
      "Start planning at least 3 months in advance",
      "Get at least 3 quotes for each vendor category",
      "Keep 10% of budget as contingency",
      "Communicate clearly with all vendors about expectations",
      "Create a detailed timeline for the event day"
    ]
  };
}
