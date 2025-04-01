
export function formatJobData(analysis: any) {
  try {
    if (!analysis) return null;
    
    const data = typeof analysis === 'string' ? JSON.parse(analysis) : analysis;
    
    // Format salary data for bar chart
    const salaryData = data.extractedData?.salaryRange ? [
      { name: 'Minimum', value: data.extractedData.salaryRange.min },
      { name: 'Maximum', value: data.extractedData.salaryRange.max }
    ] : [];

    // Format skills data for bar chart
    const skillsData = data.extractedData?.skills ? 
      data.extractedData.skills.map((skill: string) => ({
        name: skill,
        value: 1
      })) : [];

    // Format market health data for pie chart
    const marketHealthData = [
      { name: 'Positive', value: 60 },
      { name: 'Neutral', value: 30 },
      { name: 'Negative', value: 10 }
    ];

    return {
      analysis: {
        extractedData: {
          salaryRange: salaryData,
          skills: skillsData
        },
        marketHealth: marketHealthData
      }
    };
  } catch (error) {
    console.error('Error formatting job data:', error);
    return null;
  }
}

export function formatAnalysisContent(analysis: any): string {
  try {
    let content = '';
    const data = typeof analysis === 'string' ? JSON.parse(analysis) : analysis;

    content += '<h1>Job Details</h1>\n';
    const { extractedData } = data;
    content += `<h2>${extractedData.title || 'Job Title'}</h2>\n`;
    content += `<p><strong>Location:</strong> ${extractedData.location}</p>\n`;
    content += `<p><strong>Job Type:</strong> ${extractedData.jobType}</p>\n`;
    content += `<p><strong>Experience Level:</strong> ${extractedData.experienceLevel}</p>\n`;
    
    if (extractedData.salaryRange) {
      content += `<p><strong>Salary Range:</strong> $${extractedData.salaryRange.min.toLocaleString()} - $${extractedData.salaryRange.max.toLocaleString()}</p>\n`;
    }

    if (extractedData.skills && extractedData.skills.length > 0) {
      content += '<h3>Required Skills</h3>\n<ul>\n';
      extractedData.skills.forEach((skill: string) => {
        content += `<li>${skill}</li>\n`;
      });
      content += '</ul>\n';
    }

    const { analysis: jobAnalysis } = data;
    
    content += '<h2>Market Analysis</h2>\n';
    content += `<p>${jobAnalysis.marketInsights}</p>\n`;

    content += '<h2>Compensation Analysis</h2>\n';
    content += `<p>${jobAnalysis.compensationAnalysis}</p>\n`;

    content += '<h2>Skills Evaluation</h2>\n';
    content += `<p>${jobAnalysis.skillsEvaluation}</p>\n`;

    if (jobAnalysis.recommendations && jobAnalysis.recommendations.length > 0) {
      content += '<h2>Recommendations</h2>\n<ul>\n';
      jobAnalysis.recommendations.forEach((rec: string) => {
        content += `<li>${rec}</li>\n`;
      });
      content += '</ul>\n';
    }

    return content;
  } catch (error) {
    console.error('Error formatting analysis:', error);
    return '<p>Error formatting analysis data</p>';
  }
}
