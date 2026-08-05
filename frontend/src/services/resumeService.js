import { delay } from './api';

export const resumeService = {
  async analyzeResume(fileName, fileText = '') {
    await delay(1800); // simulate comprehensive NLP analysis delay
    
    // Generate simulated dynamic results based on file details or random templates
    const score = Math.floor(Math.random() * 20) + 65; // random score between 65 and 85
    
    return {
      score,
      metrics: {
        atsScore: score - 2,
        impactScore: score + 5,
        grammarScore: 92,
        brevityScore: 78
      },
      analysis: {
        positives: [
          'Excellent structural separation using clear headings and dates.',
          'Strong selection of technical keywords matching typical Software Engineer descriptors.',
          'Quantifiable accomplishments mentioned in 2+ roles (e.g., "improved speed by 20%").'
        ],
        improvements: [
          {
            section: 'Experience',
            issue: 'Passive phrasing detected.',
            recommendation: 'Replace expressions like "was responsible for building" with action verbs like "Architected", "Spearheaded", or "Engineered".'
          },
          {
            section: 'Skills',
            issue: 'Unstructured stack block.',
            recommendation: 'Divide the skills list into logical groupings (e.g., Languages, Frameworks, Developer Tools) to make it easier for ATS scanning.'
          },
          {
            section: 'Header',
            issue: 'Missing professional link.',
            recommendation: 'Include a clean hyperlink to your GitHub profile or personal portfolio website.'
          }
        ]
      },
      keywordMatch: [
        { word: 'React', present: true, count: 5 },
        { word: 'Node.js', present: true, count: 2 },
        { word: 'System Design', present: false, count: 0 },
        { word: 'CI/CD', present: false, count: 0 },
        { word: 'SQL', present: true, count: 3 },
        { word: 'Kubernetes', present: false, count: 0 }
      ]
    };
  }
};
