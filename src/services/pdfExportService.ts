// PDF Export Service for Policy Intelligence Reports
import jsPDF from 'jspdf';
import { PolicyIntelligenceReport, PolicyGap } from '@/types/policyIntelligence';

export const generatePolicyReportPDF = (report: PolicyIntelligenceReport): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;
  const lineHeight = 7;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Helper functions
  const addTitle = (text: string) => {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(text, margin, yPos);
    yPos += 12;
  };

  const addSubtitle = (text: string) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text(text, margin, yPos);
    yPos += 10;
  };

  const addText = (text: string, indent = 0) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    doc.text(lines, margin + indent, yPos);
    yPos += lines.length * lineHeight;
  };

  const addBoldText = (label: string, value: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text(label, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + doc.getTextWidth(label) + 2, yPos);
    yPos += lineHeight;
  };

  const addLine = () => {
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
  };

  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  const getSeverityText = (severity: PolicyGap['severity']) => {
    switch (severity) {
      case 'critical': return 'CRITICAL';
      case 'high': return 'HIGH';
      case 'medium': return 'MEDIUM';
      case 'low': return 'LOW';
    }
  };

  // Document Header
  addTitle('Policy Intelligence Report');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${new Date(report.generatedAt).toLocaleDateString()}`, margin, yPos);
  yPos += 15;
  addLine();

  // Overview Section
  addSubtitle('Executive Summary');
  addBoldText('Overall Risk Score: ', `${report.overallRiskScore}/100`);
  addBoldText('Total Financial Exposure: ', `£${report.totalExposure.toLocaleString()}`);
  addBoldText('Critical Gaps Identified: ', `${report.criticalGapsCount}`);
  addBoldText('Extraction Confidence: ', `${Math.round(report.extractedPolicy.extractionConfidence * 100)}%`);
  yPos += 5;
  addLine();

  // User Profile Summary
  checkNewPage(50);
  addSubtitle('Your Profile Summary');
  addBoldText('Name: ', report.userProfile.name);
  addBoldText('Location: ', report.userProfile.location);
  addBoldText('Property Type: ', report.userProfile.propertyType);
  addBoldText('Property Value: ', `£${report.userProfile.propertyValue.toLocaleString()}`);
  addBoldText('Contents Value: ', `£${report.userProfile.contentsValue.toLocaleString()}`);
  if (report.userProfile.workFromHome) {
    addBoldText('Work From Home: ', `${report.userProfile.workFromHomeDays} days/week`);
  }
  if (report.userProfile.highValueItems.length > 0) {
    addBoldText('High Value Items: ', report.userProfile.highValueItems.map(i => i.name).join(', '));
  }
  yPos += 5;
  addLine();

  // Policy Coverage Summary
  checkNewPage(60);
  addSubtitle('Extracted Policy Coverage');
  if (report.extractedPolicy.coverage.buildings) {
    addBoldText('Buildings Cover: ', `£${report.extractedPolicy.coverage.buildings.toLocaleString()}`);
  }
  if (report.extractedPolicy.coverage.contents) {
    addBoldText('Contents Cover: ', `£${report.extractedPolicy.coverage.contents.toLocaleString()}`);
  }
  if (report.extractedPolicy.itemLimits.singleItemLimit) {
    addBoldText('Single Item Limit: ', `£${report.extractedPolicy.itemLimits.singleItemLimit.toLocaleString()}`);
  }
  if (report.extractedPolicy.excess.standard) {
    addBoldText('Standard Excess: ', `£${report.extractedPolicy.excess.standard}`);
  }
  yPos += 5;

  // Exclusions
  if (report.extractedPolicy.exclusions.length > 0) {
    addText('Exclusions: ' + report.extractedPolicy.exclusions.join(', '));
    yPos += 5;
  }
  addLine();

  // Gap Analysis
  checkNewPage(40);
  addSubtitle('Coverage Gap Analysis');
  
  if (report.gaps.length === 0) {
    addText('No significant coverage gaps identified. Your policy appears to match your situation well.');
  } else {
    report.gaps.forEach((gap, index) => {
      checkNewPage(50);
      
      // Gap header
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(55, 65, 81);
      doc.text(`${index + 1}. ${gap.category}`, margin, yPos);
      
      // Severity badge
      doc.setFontSize(9);
      if (gap.severity === 'critical') {
        doc.setTextColor(239, 68, 68);
      } else if (gap.severity === 'high') {
        doc.setTextColor(249, 115, 22);
      } else if (gap.severity === 'medium') {
        doc.setTextColor(234, 179, 8);
      } else {
        doc.setTextColor(34, 197, 94);
      }
      doc.text(`[${getSeverityText(gap.severity)}]`, pageWidth - margin - 30, yPos);
      yPos += lineHeight;

      addText(`Your Situation: ${gap.userSituation}`, 5);
      addText(`Policy Reality: ${gap.policyReality}`, 5);
      addText(`Gap: ${gap.gapIdentified}`, 5);
      
      if (gap.financialExposure) {
        addText(`Financial Exposure: £${gap.financialExposure.toLocaleString()}`, 5);
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(79, 70, 229);
      const recLines = doc.splitTextToSize(`Recommendation: ${gap.recommendation}`, contentWidth - 10);
      doc.text(recLines, margin + 5, yPos);
      yPos += recLines.length * lineHeight + 5;
    });
  }
  addLine();

  // Recommendations
  if (report.recommendations.length > 0) {
    checkNewPage(40);
    addSubtitle('Key Recommendations');
    report.recommendations.forEach((rec, index) => {
      addText(`${index + 1}. ${rec}`);
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(156, 163, 175);
  const footerText = 'Generated by Policy Intelligence - AI-powered insurance analysis';
  doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  // Download the PDF
  doc.save(`policy-intelligence-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
