import type { Quiz } from '../types/quiz';

export const quizzes: Quiz[] = [
  {
    id: 'math-basics',
    title: 'Math Basics',
    description: 'Test your fundamental math skills with basic arithmetic and algebra',
    category: 'Mathematics',
    difficulty: 'easy',
    rewardAmount: 0.01,
    icon: '🔢',
    estimatedTime: 5,
    questions: [
      {
        id: 'math-1',
        question: 'What is 15 + 27?',
        options: ['40', '42', '44', '46'],
        correctAnswer: 1,
        explanation: '15 + 27 = 42'
      },
      {
        id: 'math-2',
        question: 'What is 8 × 7?',
        options: ['54', '56', '58', '64'],
        correctAnswer: 1,
        explanation: '8 × 7 = 56'
      },
      {
        id: 'math-3',
        question: 'What is the square root of 144?',
        options: ['10', '11', '12', '14'],
        correctAnswer: 2,
        explanation: '√144 = 12 because 12² = 144'
      },
      {
        id: 'math-4',
        question: 'If x + 5 = 12, what is x?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2,
        explanation: 'x + 5 = 12, so x = 12 - 5 = 7'
      },
      {
        id: 'math-5',
        question: 'What is 45 ÷ 9?',
        options: ['4', '5', '6', '7'],
        correctAnswer: 1,
        explanation: '45 ÷ 9 = 5'
      }
    ]
  },
  {
    id: 'history-world',
    title: 'World History',
    description: 'Explore major events and figures in world history',
    category: 'History',
    difficulty: 'medium',
    rewardAmount: 0.015,
    icon: '🏛️',
    estimatedTime: 8,
    questions: [
      {
        id: 'hist-1',
        question: 'In which year did World War II end?',
        options: ['1944', '1945', '1946', '1947'],
        correctAnswer: 1,
        explanation: 'World War II ended in 1945 with the surrender of Japan in September.'
      },
      {
        id: 'hist-2',
        question: 'Who was the first person to walk on the moon?',
        options: ['Buzz Aldrin', 'Neil Armstrong', 'John Glenn', 'Alan Shepard'],
        correctAnswer: 1,
        explanation: 'Neil Armstrong was the first person to walk on the moon on July 20, 1969.'
      },
      {
        id: 'hist-3',
        question: 'Which empire was ruled by Julius Caesar?',
        options: ['Greek Empire', 'Roman Empire', 'Byzantine Empire', 'Ottoman Empire'],
        correctAnswer: 1,
        explanation: 'Julius Caesar was a Roman general and statesman who ruled the Roman Empire.'
      },
      {
        id: 'hist-4',
        question: 'In which year did the Berlin Wall fall?',
        options: ['1987', '1988', '1989', '1990'],
        correctAnswer: 2,
        explanation: 'The Berlin Wall fell on November 9, 1989.'
      },
      {
        id: 'hist-5',
        question: 'Who painted the Mona Lisa?',
        options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
        correctAnswer: 1,
        explanation: 'Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.'
      }
    ]
  },
  {
    id: 'science-physics',
    title: 'Basic Physics',
    description: 'Fundamental concepts in physics and natural phenomena',
    category: 'Science',
    difficulty: 'medium',
    rewardAmount: 0.02,
    icon: '⚛️',
    estimatedTime: 10,
    questions: [
      {
        id: 'phys-1',
        question: 'What is the speed of light in a vacuum?',
        options: ['300,000 km/s', '299,792,458 m/s', '186,000 miles/s', 'All of the above'],
        correctAnswer: 3,
        explanation: 'The speed of light is approximately 299,792,458 m/s, which equals about 300,000 km/s or 186,000 miles/s.'
      },
      {
        id: 'phys-2',
        question: 'What force keeps planets in orbit around the sun?',
        options: ['Magnetic force', 'Electric force', 'Gravitational force', 'Nuclear force'],
        correctAnswer: 2,
        explanation: 'Gravitational force between the sun and planets keeps them in orbit.'
      },
      {
        id: 'phys-3',
        question: 'What is the first law of thermodynamics?',
        options: ['Energy cannot be created or destroyed', 'Entropy always increases', 'Heat flows from hot to cold', 'Force equals mass times acceleration'],
        correctAnswer: 0,
        explanation: 'The first law of thermodynamics states that energy cannot be created or destroyed, only transformed.'
      },
      {
        id: 'phys-4',
        question: 'What particle has no electric charge?',
        options: ['Proton', 'Electron', 'Neutron', 'Ion'],
        correctAnswer: 2,
        explanation: 'Neutrons have no electric charge, while protons are positive and electrons are negative.'
      },
      {
        id: 'phys-5',
        question: 'At what temperature does water freeze at sea level?',
        options: ['0°C', '32°F', '273.15 K', 'All of the above'],
        correctAnswer: 3,
        explanation: 'Water freezes at 0°C, 32°F, or 273.15 K - these are all the same temperature in different scales.'
      }
    ]
  },
  {
    id: 'crypto-basics',
    title: 'Cryptocurrency Basics',
    description: 'Learn the fundamentals of blockchain and cryptocurrency',
    category: 'Technology',
    difficulty: 'easy',
    rewardAmount: 0.025,
    icon: '₿',
    estimatedTime: 7,
    questions: [
      {
        id: 'crypto-1',
        question: 'What is a blockchain?',
        options: ['A type of cryptocurrency', 'A distributed ledger technology', 'A mining algorithm', 'A wallet application'],
        correctAnswer: 1,
        explanation: 'A blockchain is a distributed ledger technology that maintains a continuously growing list of records.'
      },
      {
        id: 'crypto-2',
        question: 'What does TON stand for?',
        options: ['The Open Network', 'Total Online Network', 'Telegram Open Network', 'Token Operation Network'],
        correctAnswer: 0,
        explanation: 'TON stands for The Open Network, a decentralized blockchain platform.'
      },
      {
        id: 'crypto-3',
        question: 'What is a smart contract?',
        options: ['A legal document', 'Self-executing code on blockchain', 'A type of wallet', 'A mining pool'],
        correctAnswer: 1,
        explanation: 'A smart contract is self-executing code that runs on a blockchain when predetermined conditions are met.'
      },
      {
        id: 'crypto-4',
        question: 'What is the process of validating transactions called?',
        options: ['Hashing', 'Mining', 'Staking', 'Both B and C'],
        correctAnswer: 3,
        explanation: 'Transaction validation can be done through mining (Proof of Work) or staking (Proof of Stake).'
      },
      {
        id: 'crypto-5',
        question: 'What makes cryptocurrency transactions secure?',
        options: ['Bank verification', 'Government backing', 'Cryptographic algorithms', 'Physical storage'],
        correctAnswer: 2,
        explanation: 'Cryptocurrency transactions are secured through cryptographic algorithms and the decentralized nature of blockchain.'
      }
    ]
  }
];

export const getQuizById = (id: string): Quiz | undefined => {
  return quizzes.find(quiz => quiz.id === id);
};

export const getQuizzesByCategory = (category: string): Quiz[] => {
  return quizzes.filter(quiz => quiz.category === category);
};

export const getQuizzesByDifficulty = (difficulty: string): Quiz[] => {
  return quizzes.filter(quiz => quiz.difficulty === difficulty);
};