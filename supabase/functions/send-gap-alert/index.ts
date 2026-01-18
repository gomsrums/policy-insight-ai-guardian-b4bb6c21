import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GapAlertRequest {
  email: string;
  userName: string;
  criticalGapsCount: number;
  totalExposure: number;
  riskScore: number;
  gaps: Array<{
    category: string;
    severity: string;
    gapIdentified: string;
    financialExposure?: number;
    recommendation: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const { email, userName, criticalGapsCount, totalExposure, riskScore, gaps }: GapAlertRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build HTML email
    const criticalGaps = gaps.filter(g => g.severity === 'critical' || g.severity === 'high');
    
    const gapsHtml = criticalGaps.map(gap => `
      <div style="background: ${gap.severity === 'critical' ? '#fee2e2' : '#fed7aa'}; border-left: 4px solid ${gap.severity === 'critical' ? '#ef4444' : '#f97316'}; padding: 16px; margin: 12px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">
          ${gap.severity.toUpperCase()}: ${gap.category}
        </h3>
        <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">
          ${gap.gapIdentified}
        </p>
        ${gap.financialExposure ? `<p style="margin: 0 0 8px 0; color: #dc2626; font-weight: bold; font-size: 14px;">Financial Exposure: £${gap.financialExposure.toLocaleString()}</p>` : ''}
        <p style="margin: 0; color: #059669; font-size: 14px; font-style: italic;">
          💡 ${gap.recommendation}
        </p>
      </div>
    `).join('');

    const getRiskColor = (score: number) => {
      if (score >= 70) return '#ef4444';
      if (score >= 40) return '#f97316';
      return '#22c55e';
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Policy Intelligence Alert</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Critical coverage gaps detected</p>
          </div>
          
          <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px; margin: 0 0 24px 0;">
              Hi ${userName || 'there'},
            </p>
            
            <p style="margin: 0 0 24px 0;">
              Your recent policy analysis has identified <strong style="color: #dc2626;">${criticalGapsCount} critical coverage gap${criticalGapsCount > 1 ? 's' : ''}</strong> that require your immediate attention.
            </p>
            
            <div style="display: flex; gap: 16px; margin: 24px 0;">
              <div style="flex: 1; background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: ${getRiskColor(riskScore)};">${riskScore}</div>
                <div style="color: #6b7280; font-size: 14px;">Risk Score</div>
              </div>
              <div style="flex: 1; background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #dc2626;">£${totalExposure.toLocaleString()}</div>
                <div style="color: #6b7280; font-size: 14px;">Total Exposure</div>
              </div>
            </div>
            
            <h2 style="color: #1f2937; font-size: 18px; margin: 32px 0 16px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
              Critical & High Priority Gaps
            </h2>
            
            ${gapsHtml}
            
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin: 32px 0;">
              <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 16px;">
                📋 What to do next
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #15803d;">
                <li>Review your current policy documents</li>
                <li>Contact your insurer about coverage adjustments</li>
                <li>Consider specialist cover for high-value items</li>
                <li>Download your full report for broker discussions</li>
              </ul>
            </div>
            
            <p style="margin: 32px 0 0 0; color: #6b7280; font-size: 14px;">
              This alert was generated by Policy Intelligence AI. For detailed analysis, log in to view your complete report.
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} Policy Intelligence | AI-Powered Insurance Analysis
            </p>
          </div>
        </body>
      </html>
    `;

    console.log('Sending gap alert email to:', email);

    const emailResponse = await resend.emails.send({
      from: "Policy Intelligence <onboarding@resend.dev>",
      to: [email],
      subject: `⚠️ Alert: ${criticalGapsCount} Critical Coverage Gap${criticalGapsCount > 1 ? 's' : ''} Detected - £${totalExposure.toLocaleString()} at risk`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-gap-alert function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
