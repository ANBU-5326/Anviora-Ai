import { delay } from './api';

const QUESTIONS = {
  frontend: [
    { id: 1, text: 'Explain the difference between Virtual DOM and Shadow DOM.', hint: 'Think about implementation in React vs Web Components.' },
    { id: 2, text: 'What is event delegation and how does it work?', hint: 'Think about bubbling, event target, and memory footprints.' },
    { id: 3, text: 'How do you optimize a React application with massive tables/lists?', hint: 'Mention virtualization, memoization, and component structural splits.' }
  ],
  backend: [
    { id: 1, text: 'How do you design a database schema for scalability?', hint: 'Discuss normalization, indexing, partitioning, and read-replicas.' },
    { id: 2, text: 'What are the main differences between SQL and NoSQL?', hint: 'Talk about strictness of schema, ACID properties, and scaling characteristics.' },
    { id: 3, text: 'How does connection pooling work in API backend services?', hint: 'Talk about socket reuse, resource caps, and performance benefits.' }
  ],
  behavioral: [
    { id: 1, text: 'Tell me about a time you had a conflict with a teammate and how you resolved it.', hint: 'Use the STAR method: Situation, Task, Action, Result.' },
    { id: 2, text: 'Describe a complex technical challenge you faced and how you overcame it.', hint: 'Focus on your analytical approach and what you learned.' },
    { id: 3, text: 'Why do you want to join our organization?', hint: 'Align your career goals with the company culture and product challenges.' }
  ]
};

export const interviewService = {
  async getQuestions(category) {
    await delay(600);
    return QUESTIONS[category] || QUESTIONS.frontend;
  },

  async evaluateAnswer(questionText, answerText) {
    await delay(1500); // simulate LLM evaluation time
    
    if (answerText.trim().length < 15) {
      return {
        score: 40,
        feedback: 'Your answer is too short. Try elaboration: explain concepts in detail, state examples, and provide technical context.',
        improvements: ['Elaborate with actual examples.', 'Incorporate relevant keywords.']
      };
    }

    const score = Math.floor(Math.random() * 25) + 70; // random score between 70 and 95
    return {
      score,
      feedback: 'Excellent response! You clearly structured your answer and addressed key terminology. The explanation is crisp and covers the operational mechanics.',
      improvements: [
        'Could be enhanced by discussing trade-offs or edge-case performance drops.',
        'Consider explaining real-world scenarios where you utilized this concept.'
      ]
    };
  }
};
