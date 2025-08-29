import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Clipboard } from 'react-native';
import { generateFlashcardsWithOpenAI } from '../../api/api';

export default function FlashcardsScreen() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample flashcards data
  const [flashcards, setFlashcards] = useState([
    {
      id: 1,
      front: 'What is React Native?',
      back: 'A framework for building native mobile applications using React and JavaScript.'
    },
    {
      id: 2,
      front: 'What is Expo?',
      back: 'A platform and framework for React Native that provides tools and services to help you build React Native apps.'
    },
    {
      id: 3,
      front: 'What is a component in React?',
      back: 'A reusable piece of UI that can contain its own logic and styling.'
    }
  ]);

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const addCard = () => {
    if (newCardFront.trim() && newCardBack.trim()) {
      const newCard = {
        id: Date.now(),
        front: newCardFront.trim(),
        back: newCardBack.trim()
      };
      setFlashcards([...flashcards, newCard]);
      setNewCardFront('');
      setNewCardBack('');
      setShowAddForm(false);
      Alert.alert('Success', 'Flashcard added successfully!');
    } else {
      Alert.alert('Error', 'Please fill in both front and back of the card');
    }
  };

  const generateWithAI = async () => {
    if (!aiInput.trim()) {
      Alert.alert('Error', 'Please enter some study material to generate flashcards');
      return;
    }

    setIsGenerating(true);
    
    try {
      const aiFlashcards = await generateFlashcardsWithOpenAI(aiInput);
      
      if (aiFlashcards && Array.isArray(aiFlashcards)) {
        const newCards = aiFlashcards.map((card, index) => ({
          id: Date.now() + index,
          front: card.front,
          back: card.back
        }));
        
        setFlashcards(prev => [...prev, ...newCards]);
        setAiInput('');
        setShowAIGenerator(false);
        Alert.alert('Success', `Generated ${newCards.length} flashcards with AI!`);
      } else {
        throw new Error('Invalid flashcard format from AI');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      // Fallback to mock generation if API fails
      const mockCards = generateMockFlashcards(aiInput);
      setFlashcards(prev => [...prev, ...mockCards]);
      setAiInput('');
      setShowAIGenerator(false);
      Alert.alert('Info', 'Using offline generation (AI service unavailable)');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockFlashcards = (input) => {
    // Mock flashcard generation for offline use
    const mockCards = [
      {
        id: Date.now(),
        front: `Key concept from: ${input.substring(0, 30)}...`,
        back: 'This is a mock flashcard generated offline. Add your OpenAI API key for AI-powered generation.'
      },
      {
        id: Date.now() + 1,
        front: 'Important term or question',
        back: 'Definition or answer based on your study material.'
      }
    ];
    return mockCards;
  };

  const shareCard = () => {
    const currentCard = flashcards[currentCardIndex];
    const cardText = `Front: ${currentCard.front}\nBack: ${currentCard.back}`;
    
    Clipboard.setString(cardText);
    Alert.alert('Copied!', 'Flashcard copied to clipboard');
  };

  const deleteCard = () => {
    if (flashcards.length > 1) {
      Alert.alert(
        'Delete Card',
        'Are you sure you want to delete this card?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              const newCards = flashcards.filter((_, index) => index !== currentCardIndex);
              setFlashcards(newCards);
              if (currentCardIndex >= newCards.length) {
                setCurrentCardIndex(Math.max(0, newCards.length - 1));
              }
              setIsFlipped(false);
              Alert.alert('Deleted', 'Flashcard removed successfully');
            }
          }
        ]
      );
    } else {
      Alert.alert('Cannot Delete', 'You need at least one flashcard');
    }
  };

  const exportDeck = () => {
    const deckText = flashcards.map(card => 
      `Front: ${card.front}\nBack: ${card.back}\n---`
    ).join('\n');
    
    Clipboard.setString(deckText);
    Alert.alert('Exported!', 'Flashcard deck copied to clipboard');
  };

  if (flashcards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No flashcards yet!</Text>
        <TouchableOpacity style={styles.button} onPress={() => setShowAddForm(true)}>
          <Text style={styles.buttonText}>➕ Add Your First Card</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Flashcards</Text>
        <Text style={styles.subtitle}>Card {currentCardIndex + 1} of {flashcards.length}</Text>
      </View>

      {/* AI Generator Section */}
      {showAIGenerator && (
        <View style={styles.aiSection}>
          <Text style={styles.sectionTitle}>🤖 Generate with AI</Text>
          <TextInput
            style={styles.aiInput}
            placeholder="Enter your study material here..."
            value={aiInput}
            onChangeText={setAiInput}
            multiline
            numberOfLines={4}
          />
          <View style={styles.aiButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.generateButton]} 
              onPress={generateWithAI}
              disabled={isGenerating}
            >
              <Text style={styles.buttonText}>
                {isGenerating ? '🔄 Generating...' : '🚀 Generate Cards'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => setShowAIGenerator(false)}
            >
              <Text style={styles.buttonText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Flashcard Display */}
      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={flipCard}>
          <Text style={styles.cardText}>
            {isFlipped ? currentCard.back : currentCard.front}
          </Text>
          <Text style={styles.flipHint}>
            {isFlipped ? '👆 Tap to see question' : '👆 Tap to see answer'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.navButton} onPress={prevCard} disabled={currentCardIndex === 0}>
          <Text style={[styles.navButtonText, currentCardIndex === 0 && styles.disabledText]}>◀</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
          <Text style={styles.flipButtonText}>🔄</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={nextCard} disabled={currentCardIndex === flashcards.length - 1}>
          <Text style={[styles.navButtonText, currentCardIndex === flashcards.length - 1 && styles.disabledText]}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.button} onPress={() => setShowAddForm(true)}>
          <Text style={styles.buttonText}>➕ Add Card</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => setShowAIGenerator(true)}>
          <Text style={styles.buttonText}>🤖 Generate with AI</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={shareCard}>
          <Text style={styles.buttonText}>📤 Share Card</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={deleteCard}>
          <Text style={styles.buttonText}>🗑️ Delete Card</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={exportDeck}>
          <Text style={styles.buttonText}>📁 Export Deck</Text>
        </TouchableOpacity>
      </View>

      {/* Add New Card Form */}
      {showAddForm && (
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>➕ Add New Card</Text>
          <TextInput
            style={styles.input}
            placeholder="Front of card (question/term)"
            value={newCardFront}
            onChangeText={setNewCardFront}
          />
          <TextInput
            style={styles.input}
            placeholder="Back of card (answer/definition)"
            value={newCardBack}
            onChangeText={setNewCardBack}
            multiline
            numberOfLines={3}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={addCard}>
              <Text style={styles.buttonText}>💾 Save Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setShowAddForm(false)}>
              <Text style={styles.buttonText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%', // Changed to 100% to fill container
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 20,
  },
  cardText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 32,
  },
  flipHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  navButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  navButtonText: {
    fontSize: 20,
    color: '#6366F1',
  },
  disabledText: {
    opacity: 0.5,
  },
  flipButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  flipButtonText: {
    fontSize: 20,
    color: '#6366F1',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#6366F1',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  saveButton: {
    backgroundColor: '#22C55E',
  },
  formSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#374151',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  aiSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  aiInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#374151',
    minHeight: 100,
  },
  aiButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emptyText: {
    fontSize: 20,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 100,
  },
});
