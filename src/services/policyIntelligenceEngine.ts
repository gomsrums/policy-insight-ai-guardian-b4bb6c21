// True Policy Intelligence Engine
// Extracts detailed policy data and matches against user profile

import { 
  UserProfile, 
  ExtractedPolicyIntelligence, 
  PolicyGap, 
  PolicyIntelligenceReport 
} from '@/types/policyIntelligence';
import { supabase } from '@/integrations/supabase/client';

export class PolicyIntelligenceEngine {
  
  // Extract structured policy data using AI
  async extractPolicyIntelligence(policyText: string): Promise<ExtractedPolicyIntelligence> {
    try {
      const { data, error } = await supabase.functions.invoke('policy-intelligence-extract', {
        body: { policyText }
      });

      if (error) throw error;
      return data as ExtractedPolicyIntelligence;
    } catch (error) {
      console.error('Policy extraction error:', error);
      // Return a parsed structure from basic analysis
      return this.basicExtraction(policyText);
    }
  }

  // Basic extraction fallback
  private basicExtraction(policyText: string): ExtractedPolicyIntelligence {
    const text = policyText.toLowerCase();
    
    // Extract coverage amounts using regex patterns
    const buildingsMatch = text.match(/buildings?\s*(?:cover|sum insured|limit)?\s*[:\s]*£?\s*([\d,]+)/i);
    const contentsMatch = text.match(/contents?\s*(?:cover|sum insured|limit)?\s*[:\s]*£?\s*([\d,]+)/i);
    const singleItemMatch = text.match(/single\s*item\s*limit\s*[:\s]*£?\s*([\d,]+)/i);
    const gardenMatch = text.match(/garden\s*(?:structures?|buildings?)\s*[:\s]*£?\s*([\d,]+)/i);
    
    // Extract excess amounts
    const standardExcessMatch = text.match(/(?:standard|voluntary)\s*excess\s*[:\s]*£?\s*([\d,]+)/i);
    const waterExcessMatch = text.match(/(?:escape\s*of\s*water|water\s*damage)\s*excess\s*[:\s]*£?\s*([\d,]+)/i);
    
    // Detect exclusions
    const exclusions: string[] = [];
    if (text.includes('flood') && (text.includes('exclud') || text.includes('not cover'))) {
      exclusions.push('Flood damage');
    }
    if (text.includes('business') && text.includes('exclud')) {
      exclusions.push('Business use');
    }
    if (text.includes('working from home') && text.includes('not cover')) {
      exclusions.push('Working from home equipment');
    }
    if (text.includes('wear and tear')) {
      exclusions.push('Wear and tear');
    }
    if (text.includes('gradual deterioration')) {
      exclusions.push('Gradual deterioration');
    }
    if (text.includes('unoccupied') && text.includes('30 days')) {
      exclusions.push('Unoccupied property over 30 days');
    }

    return {
      policyNumber: 'Unknown',
      insurer: 'Unknown Insurer',
      policyType: 'Home Insurance',
      coverage: {
        buildings: buildingsMatch ? parseInt(buildingsMatch[1].replace(/,/g, '')) : undefined,
        contents: contentsMatch ? parseInt(contentsMatch[1].replace(/,/g, '')) : undefined,
      },
      excess: {
        standard: standardExcessMatch ? parseInt(standardExcessMatch[1].replace(/,/g, '')) : 500,
        escapeOfWater: waterExcessMatch ? parseInt(waterExcessMatch[1].replace(/,/g, '')) : 1000,
      },
      itemLimits: {
        singleItemLimit: singleItemMatch ? parseInt(singleItemMatch[1].replace(/,/g, '')) : 1500,
        gardenStructures: gardenMatch ? parseInt(gardenMatch[1].replace(/,/g, '')) : 2500,
      },
      exclusions,
      conditions: [],
      coveredPerils: ['Fire', 'Theft', 'Storm damage'],
      addOns: [],
      extractionConfidence: 0.6,
      extractedAt: new Date().toISOString(),
      rawDataPoints: 50
    };
  }

  // Analyze gaps between user profile and policy
  analyzeGaps(userProfile: UserProfile, policy: ExtractedPolicyIntelligence): PolicyGap[] {
    const gaps: PolicyGap[] = [];

    // 1. Check contents coverage vs actual contents value
    if (policy.coverage.contents && userProfile.contentsValue) {
      if (userProfile.contentsValue > policy.coverage.contents) {
        const exposure = userProfile.contentsValue - policy.coverage.contents;
        const percentageCovered = Math.round((policy.coverage.contents / userProfile.contentsValue) * 100);
        gaps.push({
          id: 'contents-underinsured',
          category: 'Contents Coverage',
          userSituation: `Contents worth ~£${userProfile.contentsValue.toLocaleString()}`,
          policyReality: `Covered for £${policy.coverage.contents.toLocaleString()}`,
          gapIdentified: `${100 - percentageCovered}% underinsured`,
          severity: percentageCovered < 50 ? 'critical' : percentageCovered < 75 ? 'high' : 'medium',
          financialExposure: exposure,
          percentageCovered,
          recommendation: `Increase contents cover to at least £${userProfile.contentsValue.toLocaleString()} or reduce valuables stored at home`
        });
      }
    }

    // 2. Check high value items against single item limit
    if (policy.itemLimits.singleItemLimit) {
      userProfile.highValueItems.forEach(item => {
        if (item.value > policy.itemLimits.singleItemLimit!) {
          const percentageCovered = Math.round((policy.itemLimits.singleItemLimit! / item.value) * 100);
          gaps.push({
            id: `item-limit-${item.id}`,
            category: 'Single Item Limit',
            userSituation: `You own a £${item.value.toLocaleString()} ${item.name}`,
            policyReality: `Single item limit is £${policy.itemLimits.singleItemLimit!.toLocaleString()}`,
            gapIdentified: `Only ${percentageCovered}% covered`,
            severity: percentageCovered < 50 ? 'high' : 'medium',
            financialExposure: item.value - policy.itemLimits.singleItemLimit!,
            percentageCovered,
            recommendation: `Add specified items cover or personal possessions add-on for ${item.name}`
          });
        }
      });
    }

    // 3. Check garden structures
    if (userProfile.hasGardenStructures && userProfile.gardenStructuresValue) {
      const gardenLimit = policy.itemLimits.gardenStructures || 2500;
      if (userProfile.gardenStructuresValue > gardenLimit) {
        gaps.push({
          id: 'garden-structures',
          category: 'Garden Structures',
          userSituation: `Garden structures cost £${userProfile.gardenStructuresValue.toLocaleString()}`,
          policyReality: `Garden structures max £${gardenLimit.toLocaleString()}`,
          gapIdentified: `£${(userProfile.gardenStructuresValue - gardenLimit).toLocaleString()} exposure`,
          severity: 'medium',
          financialExposure: userProfile.gardenStructuresValue - gardenLimit,
          percentageCovered: Math.round((gardenLimit / userProfile.gardenStructuresValue) * 100),
          recommendation: 'Increase garden structures limit or add separate outbuildings cover'
        });
      }
    }

    // 4. Check work from home coverage
    if (userProfile.workFromHome) {
      const hasBusinessExclusion = policy.exclusions.some(e => 
        e.toLowerCase().includes('business') || e.toLowerCase().includes('working from home')
      );
      
      if (hasBusinessExclusion || !policy.itemLimits.businessEquipment) {
        gaps.push({
          id: 'work-from-home',
          category: 'Working From Home',
          userSituation: `You work from home ${userProfile.workFromHomeDays} days/week`,
          policyReality: 'Business equipment not covered',
          gapIdentified: `Laptop, monitor at risk`,
          severity: 'high',
          financialExposure: userProfile.businessEquipmentValue || 2500,
          recommendation: 'Add home office cover or business equipment extension'
        });
      }
    }

    // 5. Check flood zone coverage
    if (userProfile.floodZone && userProfile.floodZone !== 'none' && userProfile.floodZone !== 'zone1') {
      const hasFloodExclusion = policy.exclusions.some(e => 
        e.toLowerCase().includes('flood')
      );
      
      if (hasFloodExclusion) {
        gaps.push({
          id: 'flood-exclusion',
          category: 'Flood Coverage',
          userSituation: `You're in flood ${userProfile.floodZone.replace('zone', 'zone ')}`,
          policyReality: 'Flood excluded',
          gapIdentified: 'Critical gap',
          severity: 'critical',
          recommendation: 'Seek specialist flood insurance or Flood Re scheme policy'
        });
      }
    }

    // 6. Check if running business from home
    if (userProfile.runsBusinessFromHome) {
      gaps.push({
        id: 'business-from-home',
        category: 'Business Use',
        userSituation: 'You run a business from home',
        policyReality: 'Standard home policy - business activities excluded',
        gapIdentified: 'Public liability and business contents at risk',
        severity: 'critical',
        recommendation: 'Add business use extension or separate business insurance'
      });
    }

    // 7. Check lodgers coverage
    if (userProfile.hasLodgers) {
      gaps.push({
        id: 'lodgers',
        category: 'Lodgers',
        userSituation: 'You have lodgers/tenants',
        policyReality: 'May void policy or reduce cover',
        gapIdentified: 'Policy may not cover damage caused by lodgers',
        severity: 'high',
        recommendation: 'Inform insurer about lodgers and check if policy permits this arrangement'
      });
    }

    return gaps;
  }

  // Generate full intelligence report
  async generateReport(
    userProfile: UserProfile, 
    policyText: string
  ): Promise<PolicyIntelligenceReport> {
    const extractedPolicy = await this.extractPolicyIntelligence(policyText);
    const gaps = this.analyzeGaps(userProfile, extractedPolicy);
    
    // Calculate overall risk score (100 = high risk, 0 = low risk)
    const criticalGaps = gaps.filter(g => g.severity === 'critical').length;
    const highGaps = gaps.filter(g => g.severity === 'high').length;
    const mediumGaps = gaps.filter(g => g.severity === 'medium').length;
    
    const riskScore = Math.min(100, criticalGaps * 30 + highGaps * 15 + mediumGaps * 5);
    
    // Calculate total financial exposure
    const totalExposure = gaps.reduce((sum, gap) => sum + (gap.financialExposure || 0), 0);

    // Generate recommendations
    const recommendations: string[] = [];
    if (criticalGaps > 0) {
      recommendations.push('Address critical coverage gaps immediately to avoid major financial exposure');
    }
    if (gaps.some(g => g.id.includes('item-limit'))) {
      recommendations.push('Consider specifying high-value items individually on your policy');
    }
    if (gaps.some(g => g.id === 'contents-underinsured')) {
      recommendations.push('Review and increase your contents sum insured to match actual value');
    }
    if (gaps.some(g => g.id === 'work-from-home')) {
      recommendations.push('Add home office cover if you regularly work from home');
    }

    return {
      userProfile,
      extractedPolicy,
      gaps,
      overallRiskScore: riskScore,
      totalExposure,
      criticalGapsCount: criticalGaps,
      recommendations,
      generatedAt: new Date().toISOString()
    };
  }
}

export const policyIntelligenceEngine = new PolicyIntelligenceEngine();
