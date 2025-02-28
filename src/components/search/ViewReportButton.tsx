
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Terms } from "@/types/agent";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ViewReportButtonProps {
  jobSummary: string;
  enhancedDescription: string;
  compensationAnalysis: string;
  terms: Terms | null;
  onClick?: () => void;
  isExporting?: boolean;
}

export const ViewReportButton = ({ 
  jobSummary, 
  enhancedDescription, 
  compensationAnalysis, 
  terms,
  onClick,
  isExporting = false
}: ViewReportButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (onClick) {
      onClick();
      return;
    }

    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      
      // Build a simple report structure
      const reportContainer = document.createElement("div");
      reportContainer.style.padding = "20px";
      reportContainer.style.width = "800px";
      reportContainer.style.fontFamily = "Arial, sans-serif";
      
      reportContainer.innerHTML = `
        <h1 style="font-size: 24px; margin-bottom: 20px;">Job Analysis Report</h1>
        
        <h2 style="font-size: 18px; margin-top: 30px;">Job Summary</h2>
        <div style="margin-bottom: 20px; white-space: pre-wrap;">${jobSummary}</div>
        
        <h2 style="font-size: 18px; margin-top: 30px;">Enhanced Description</h2>
        <div style="margin-bottom: 20px; white-space: pre-wrap;">${enhancedDescription}</div>
        
        <h2 style="font-size: 18px; margin-top: 30px;">Compensation Analysis</h2>
        <div style="margin-bottom: 20px; white-space: pre-wrap;">${compensationAnalysis}</div>
        
        <h2 style="font-size: 18px; margin-top: 30px;">Key Terms</h2>
        <div style="margin-bottom: 20px;">
          ${terms?.skills?.length ? `
            <h3 style="font-size: 16px; margin-top: 10px;">Skills</h3>
            <ul>
              ${terms.skills.map(skill => `<li>${skill}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${terms?.titles?.length ? `
            <h3 style="font-size: 16px; margin-top: 10px;">Job Titles</h3>
            <ul>
              ${terms.titles.map(title => `<li>${title}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${terms?.keywords?.length ? `
            <h3 style="font-size: 16px; margin-top: 10px;">Keywords</h3>
            <ul>
              ${terms.keywords.map(keyword => `<li>${keyword}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `;
      
      // Add the report container to the document temporarily
      document.body.appendChild(reportContainer);
      
      // Convert to canvas and then to PDF
      const canvas = await html2canvas(reportContainer);
      const imgData = canvas.toDataURL('image/png');
      
      // Determine the page width and height
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      pdf.save('job-analysis-report.pdf');
      
      // Clean up
      document.body.removeChild(reportContainer);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <Button
        onClick={generatePDF}
        disabled={isExporting || isGenerating}
        className="border-4 border-black bg-[#8B5CF6] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        <Download className="w-5 h-5 mr-2" />
        {isExporting || isGenerating ? 'Downloading...' : 'Download Analysis Report'}
      </Button>
    </div>
  );
};
