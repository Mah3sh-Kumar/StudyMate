import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Clipboard } from 'react-native';
import { generateQuizWithOpenAI } from '../../api/api';

export default function QuizScreen() {
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
        // Transform OpenAI response to our quiz format
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
      // Fallback to mock quiz if API fails
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

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: quiz.questions.length, percentage: Math.round((correct / quiz.questions.length) * 100) };
  };

  const resetQuiz = () => {
    setQuiz(null);
    setStudyMaterial('');
    setSelectedAnswers({});
    setShowResults(false);
    setCurrentQuestion(0);
  };

  const handleUploadFile = () => {
    Alert.alert('Upload File', 'File upload functionality will be implemented with document processing');
  };

  const handleScanNotes = () => {
    Alert.alert('Scan Notes', 'Document scanning will be implemented with camera integration');
  };

  const shareResults = async () => {
    const score = calculateScore();
    const shareText = `I scored ${score.correct}/${score.total} (${score.percentage}%) on my AI-generated quiz! 🎯`;
    
    try {
      await Clipboard.setString(shareText);
      Alert.alert('Success', 'Results copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy results');
    }
  };

  if (!quiz) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Quiz Generator</Text>
          <Text style={styles.headerSubtitle}>Create personalized quizzes from your study materials</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>📚 Input Study Material</Text>
          <TextInput
            style={styles.materialInput}
            placeholder="Paste your notes, textbook content, or any study material here..."
            placeholderTextColor="#9CA3AF"
            value={studyMaterial}
            onChangeText={setStudyMaterial}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
          
          <View style={styles.uploadOptions}>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadFile}>
              <Text style={styles.uploadIcon}>📁</Text>
              <Text style={styles.uploadText}>Upload File</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.uploadButton} onPress={handleScanNotes}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Scan Notes</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.generateSection}>
          <TouchableOpacity 
            style={[styles.generateButton, isGenerating && styles.disabledButton]} 
            onPress={handleGenerateQuiz}
            disabled={isGenerating}
          >
            <Text style={styles.generateIcon}>
              {isGenerating ? '⏳' : '🤖'}
            </Text>
            <Text style={styles.generateText}>
              {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>🎯 Quiz Features</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>AI-powered question generation</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Multiple choice questions with explanations</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Adaptive difficulty based on content</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureText}>Performance tracking and analytics</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quiz Results</Text>
          <Text style={styles.headerSubtitle}>Here's how you performed</Text>
        </View>

        <View style={styles.resultsSection}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Your Score</Text>
            <Text style={styles.scoreNumber}>{score.correct}/{score.total}</Text>
            <Text style={styles.scorePercentage}>{score.percentage}%</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreProgress, { width: `${score.percentage}%` }]} />
            </View>
          </View>

          <View style={styles.questionsReview}>
            <Text style={styles.sectionTitle}>Question Review</Text>
            {quiz.questions.map((q, index) => (
              <View key={q.id} style={styles.questionReview}>
                <Text style={styles.questionText}>Q{index + 1}: {q.question}</Text>
                <Text style={styles.correctAnswer}>
                  Correct: {q.options[q.correctAnswer]}
                </Text>
                {selectedAnswers[q.id] !== undefined && (
                  <Text style={[
                    styles.yourAnswer,
                    selectedAnswers[q.id] === q.correctAnswer ? styles.correct : styles.incorrect
                  ]}>
                    Your Answer: {q.options[selectedAnswers[q.id]]}
                  </Text>
                )}
                <Text style={styles.explanation}>{q.explanation}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.resultsActions}>
          <TouchableOpacity style={styles.retakeButton} onPress={resetQuiz}>
            <Text style={styles.retakeText}>Take Another Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={shareResults}>
            <Text style={styles.shareText}>Share Results</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{quiz.title}</Text>
        <Text style={styles.headerSubtitle}>Question {currentQuestion + 1} of {quiz.totalQuestions}</Text>
      </View>

      <View style={styles.questionSection}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQ.question}</Text>
        </View>

        <View style={styles.optionsSection}>
          {currentQ.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswers[currentQ.id] === index && styles.selectedOption
              ]}
              onPress={() => selectAnswer(currentQ.id, index)}
            >
              <Text style={[
                styles.optionText,
                selectedAnswers[currentQ.id] === index && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.navigationSection}>
        <TouchableOpacity 
          style={[styles.navButton, currentQuestion === 0 && styles.disabledButton]} 
          onPress={prevQuestion}
          disabled={currentQuestion === 0}
        >
          <Text style={styles.navText}>Previous</Text>
        </TouchableOpacity>

        {currentQuestion === quiz.questions.length - 1 ? (
          <TouchableOpacity 
            style={[styles.submitButton, Object.keys(selectedAnswers).length < quiz.questions.length && styles.disabledButton]} 
            onPress={submitQuiz}
            disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
          >
            <Text style={styles.submitText}>Submit Quiz</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={nextQuestion}>
            <Text style={styles.navText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          {quiz.questions.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.progressDot,
                index === currentQuestion && styles.currentProgressDot,
                selectedAnswers[quiz.questions[index].id] !== undefined && styles.answeredProgressDot
              ]} 
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  materialInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  uploadIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  generateSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  generateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  questionSection: {
    flex: 1,
    marginBottom: 24,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 26,
  },
  optionsSection: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    backgroundColor: '#A78BFA',
    borderColor: '#A78BFA',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#fff',
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  navButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  progressSection: {
    alignItems: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  currentProgressDot: {
    backgroundColor: '#A78BFA',
  },
  answeredProgressDot: {
    backgroundColor: '#10B981',
  },
  resultsSection: {
    marginBottom: 24,
  },
  scoreCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  scorePercentage: {
    fontSize: 24,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 16,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  questionsReview: {
    marginBottom: 24,
  },
  questionReview: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  correctAnswer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 8,
  },
  yourAnswer: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  correct: {
    color: '#10B981',
  },
  incorrect: {
    color: '#EF4444',
  },
  explanation: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  resultsActions: {
    alignItems: 'center',
    marginBottom: 40,
  },
  retakeButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  retakeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 12,
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
