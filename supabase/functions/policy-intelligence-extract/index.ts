import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { policyText } = await req.json();

    if (!policyText) {
      return new Response(
        JSON.stringify({ error: 'Policy text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert insurance policy analyst. Extract detailed structured data from insurance policy documents.

Your task is to analyze the policy text and extract the following information in JSON format:

{
  "policyNumber": "string or 'Unknown'",
  "insurer": "string or 'Unknown Insurer'",
  "policyType": "string (e.g., 'Home Insurance', 'Contents Insurance')",
  "coverage": {
    "buildings": number or null,
    "contents": number or null,
    "personalLiability": number or null,
    "legalExpenses": number or null
  },
  "excess": {
    "standard": number or null,
    "escapeOfWater": number or null,
    "subsidence": number or null,
    "accidentalDamage": number or null
  },
  "itemLimits": {
    "singleItemLimit": number or null,
    "valuablesLimit": number or null,
    "cashLimit": number or null,
    "gardenStructures": number or null,
    "bicycles": number or null,
    "businessEquipment": number or null
  },
  "exclusions": ["array of exclusion strings"],
  "conditions": ["array of special conditions"],
  "coveredPerils": ["array of covered events/perils"],
  "addOns": ["array of optional add-ons present"],
  "extractionConfidence": number between 0 and 1,
  "rawDataPoints": number of data points extracted
}

Important extraction rules:
1. Convert all monetary values to numbers (remove currency symbols and commas)
2. Extract ALL exclusions mentioned (flood, subsidence, wear and tear, business use, etc.)
3. Note if working from home or business equipment is covered or excluded
4. Identify single item limits and valuables limits
5. Extract excess/deductible amounts for different claim types
6. List what perils/events ARE covered (fire, theft, storm, etc.)
7. Rate your confidence based on document clarity (0.5-1.0)

Return ONLY valid JSON, no additional text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract structured data from this insurance policy:\n\n${policyText.substring(0, 15000)}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response
    let extractedData;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      
      extractedData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Return a basic structure if parsing fails
      extractedData = {
        policyNumber: 'Unknown',
        insurer: 'Unknown Insurer',
        policyType: 'Home Insurance',
        coverage: {},
        excess: { standard: 500 },
        itemLimits: { singleItemLimit: 1500, gardenStructures: 2500 },
        exclusions: [],
        conditions: [],
        coveredPerils: ['Fire', 'Theft', 'Storm damage'],
        addOns: [],
        extractionConfidence: 0.5,
        rawDataPoints: 20
      };
    }

    // Add metadata
    extractedData.extractedAt = new Date().toISOString();

    console.log('Extracted policy data:', JSON.stringify(extractedData, null, 2));

    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Policy intelligence extraction error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to extract policy data',
        policyNumber: 'Unknown',
        insurer: 'Unknown Insurer',
        policyType: 'Home Insurance',
        coverage: {},
        excess: { standard: 500 },
        itemLimits: { singleItemLimit: 1500, gardenStructures: 2500 },
        exclusions: [],
        conditions: [],
        coveredPerils: [],
        addOns: [],
        extractionConfidence: 0.3,
        extractedAt: new Date().toISOString(),
        rawDataPoints: 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
