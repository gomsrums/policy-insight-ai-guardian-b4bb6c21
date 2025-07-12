import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocialMediaRequest {
  topic: string;
  contentType: string;
  targetAudience: string;
  additionalContext?: string;
  platforms: string[];
  socialMediaAccounts: Record<string, string>;
  companyInfo: {
    name: string;
    description: string;
    industry: string;
    services: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: SocialMediaRequest = await req.json();
    
    console.log('Received social media content request:', requestData);

    // Process the request and prepare data for Make.com
    const processedData = {
      ...requestData,
      timestamp: new Date().toISOString(),
      status: 'received',
      webhookSource: 'supabase-edge-function'
    };

    // Here you can add logic to:
    // 1. Store the request in your database
    // 2. Validate the data
    // 3. Transform it for Make.com workflows
    // 4. Trigger additional processes

    // For now, we'll just return the processed data
    // Make.com will receive this and can use it to generate content
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Social media content request processed',
        data: processedData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing social media request:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process social media content request',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});