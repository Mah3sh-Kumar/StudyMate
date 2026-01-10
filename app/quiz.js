import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { generateQuizWithOpenAI } from '../api/api';

export default function QuizScreen() {
  const navTheme = useTheme();
  const [studyMaterial, setStudyMaterial] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!studyMaterial.trim()) {
      Alert.alert('Error', 'Please enter some study material to generate a quiz');
      return;
    }

    setIsGenerating(true);
    
    try {
      const aiQuiz = await generateQuizWithOpenAI(studyMaterial);
      if (aiQuiz && aiQuiz.questions) {
        const transformedQuiz = {
          title: 'AI-Generated Quiz',
          questions: aiQuiz.questions.map((q, index) => ({
            id: index + 1,
            question: q.question,
            options: q.options,
            correctAnswer: q.answer,
            explanation: q.explanation || 'AI-generated question based on your study material.'
          })),
          totalQuestions: aiQuiz.questions.length
        };
        setQuiz(transformedQuiz);
      } else {
        throw new Error('Invalid quiz format from AI');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      const mockQuiz = generateMockQuiz(studyMaterial);
      setQuiz(mockQuiz);
      Alert.alert('Info', 'Using offline quiz (AI service unavailable)');
    } finally {
      setIsGenerating(false);
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setShowResults(false);
    }
  };

  const generateMockQuiz = (material) => {
    const questions = [
      {
        id: 1,
        question: 'What is the main topic discussed in the material?',
        options: ['A) Study techniques', 'B) Time management', 'C) Note-taking', 'D) All of the above'],
        correctAnswer: 3,
        explanation: 'The material covers multiple aspects of effective studying.'
      },
      {
        id: 2,
        question: 'Which of the following is NOT a recommended study method?',
        options: ['A) Active recall', 'B) Spaced repetition', 'C) Cramming', 'D) Mind mapping'],
        correctAnswer: 2,
        explanation: 'Cramming is not an effective long-term study strategy.'
      },
      {
        id: 3,
        question: 'How often should you review your notes for optimal retention?',
        options: ['A) Once a week', 'B) Every day', 'C) Every few days', 'D) Only before exams'],
        correctAnswer: 2,
        explanation: 'Regular review every few days helps maintain information in long-term memory.'
      }
    ];
    
    return {
      title: 'AI-Generated Quiz',
      questions: questions,
      totalQuestions: questions.length
    };
  };

  const selectAnswer = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setStudyMaterial('');
  };

  const getScore = () => {
    let correct = 0;
    quiz.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: quiz.questions.length, percentage: Math.round((correct / quiz.questions.length) * 100) };
  };

  const getAnswerStatus = (questionId, answerIndex) => {
    if (!showResults) return 'normal';
    const question = quiz.questions.find(q => q.id === questionId);
    if (answerIndex === question.correctAnswer) return 'correct';
    if (selectedAnswers[questionId] === answerIndex) return 'incorrect';
    return 'normal';
  };

  if (!quiz) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: navTheme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: navTheme.colors.text }]}>🧠 Quiz Generator</Text>
          <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>
            Generate quizzes from your study material
          </Text>
        </View>

        {/* Input Section */}
        <View style={[styles.inputSection, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>📝 Study Material</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
            placeholder="Enter your study material, notes, or topic here..."
            placeholderTextColor={navTheme.colors.text}
            value={studyMaterial}
            onChangeText={setStudyMaterial}
            multiline
            numberOfLines={6}
          />
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: navTheme.colors.primary || '#6366F1' }]}
            onPress={handleGenerateQuiz}
            disabled={isGenerating || !studyMaterial.trim()}
          >
            <Text style={styles.generateButtonText}>
              {isGenerating ? '🔄 Generating...' : '🚀 Generate Quiz'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={[styles.instructionsSection, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={[styles.instructionsTitle, { color: navTheme.colors.text }]}>💡 How it works</Text>
          <Text style={[styles.instructionsText, { color: navTheme.colors.text }]}>
            1. Enter your study material or topic{'\n'}
            2. AI generates relevant quiz questions{'\n'}
            3. Test your knowledge and learn
          </Text>
        </View>
      </ScrollView>
    );
  }

  if (showResults) {
    const score = getScore();
    return (
      <ScrollView style={[styles.container, { backgroundColor: navTheme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Results Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: navTheme.colors.text }]}>📊 Quiz Results</Text>
          <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>
            {score.correct} out of {score.total} correct
          </Text>
        </View>

        {/* Score Display */}
        <View style={[styles.scoreContainer, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={[styles.scoreText, { color: navTheme.colors.text }]}>
            {score.percentage}%
          </Text>
          <Text style={[styles.scoreLabel, { color: navTheme.colors.text }]}>
            {score.percentage >= 80 ? 'Excellent!' : score.percentage >= 60 ? 'Good job!' : 'Keep studying!'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: navTheme.colors.primary || '#6366F1' }]}
            onPress={resetQuiz}
          >
            <Text style={styles.actionButtonText}>🔄 New Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <View style={[styles.container, { backgroundColor: navTheme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: navTheme.colors.text }]}>🧠 Quiz</Text>
        <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>
          Question {currentQuestion + 1} of {quiz.questions.length}
        </Text>
      </View>

      {/* Question */}
      <View style={[styles.questionContainer, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
        <Text style={[styles.questionText, { color: navTheme.colors.text }]}>
          {question.question}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border },
              selectedAnswers[question.id] === index && styles.selectedOption
            ]}
            onPress={() => selectAnswer(question.id, index)}
          >
            <Text style={[styles.optionText, { color: navTheme.colors.text }]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
          onPress={prevQuestion}
          disabled={currentQuestion === 0}
        >
          <Text style={[styles.navButtonText, { color: navTheme.colors.text }]}>◀ Previous</Text>
        </TouchableOpacity>

        {currentQuestion === quiz.questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: navTheme.colors.primary || '#6366F1' }]}
            onPress={submitQuiz}
          >
            <Text style={styles.submitButtonText}>📊 Submit Quiz</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
            onPress={nextQuestion}
          >
            <Text style={[styles.navButtonText, { color: navTheme.colors.text }]}>Next ▶</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    marginBottom: 22,
    minHeight: 130,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  generateButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  instructionsSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  questionContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedOption: {
    borderColor: '#6366F1',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContainer: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionButtons: {
    alignItems: 'center',
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

