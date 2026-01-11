import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Animated } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@react-navigation/native';
import { generateFlashcardsWithOpenAI } from '../api/api';
import { flashcardService } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

export default function FlashcardsScreen() {
  const navTheme = useTheme();
  const { user } = useAuth();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);

  // State for decks and cards
  const [decks, setDecks] = useState([]);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [showDeckSelector, setShowDeckSelector] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');

  // Load user's decks on component mount
  useEffect(() => {
    if (user) {
      loadUserDecks();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Load user's flashcard decks
  const loadUserDecks = async () => {
    try {
      setLoading(true);
      const { data, error } = await flashcardService.getUserDecks(user.id);

      if (error) {
        console.error('Error loading decks:', error);
        Alert.alert('❌ Error', 'Failed to load flashcard decks');
        return;
      }

      setDecks(data || []);

      // If no decks exist, create a default deck
      if (!data || data.length === 0) {
        await createDefaultDeck();
      } else {
        // Load the first deck's cards
        await loadDeckCards(data[0].id);
        setCurrentDeck(data[0]);
      }
    } catch (error) {
      console.error('Error loading decks:', error);
      Alert.alert('❌ Error', 'Failed to load flashcard decks');
    } finally {
      setLoading(false);
    }
  };

  // Create a default deck for new users
  const createDefaultDeck = async () => {
    try {
      const { data, error } = await flashcardService.createDeck(user.id, {
        name: 'My First Deck',
        description: 'Start adding your flashcards here!',
        subject: 'General',
        isPublic: false
      });

      if (error) {
        console.error('Error creating default deck:', error);
        return;
      }

      setDecks([data]);
      setCurrentDeck(data);
      setFlashcards([]);
    } catch (error) {
      console.error('Error creating default deck:', error);
    }
  };

  // Load cards from a specific deck
  const loadDeckCards = async (deckId) => {
    try {
      const { data, error } = await flashcardService.getDeckCards(deckId);

      if (error) {
        console.error('Error loading cards:', error);
        return;
      }

      setFlashcards(data || []);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  // Create new deck
  const createDeck = async () => {
    if (!newDeckName.trim()) {
      Alert.alert('❌ Error', 'Please enter a deck name');
      return;
    }

    try {
      const { data, error } = await flashcardService.createDeck(user.id, {
        name: newDeckName.trim(),
        description: newDeckDescription.trim(),
        subject: newDeckSubject.trim() || 'General',
        isPublic: false
      });

      if (error) {
        Alert.alert('❌ Error', 'Failed to create deck');
        return;
      }

      setDecks(prev => [data, ...prev]);
      setCurrentDeck(data);
      setNewDeckName('');
      setNewDeckDescription('');
      setNewDeckSubject('');
      setShowDeckSelector(false);
      setFlashcards([]);
      setCurrentCardIndex(0);

      Alert.alert('✅ Success', 'Deck created successfully!');
    } catch (error) {
      console.error('Error creating deck:', error);
      Alert.alert('❌ Error', 'Failed to create deck');
    }
  };

  // Add new card to current deck
  const addCard = async () => {
    if (!currentDeck) {
      Alert.alert('❌ Error', 'Please select a deck first');
      return;
    }

    if (!newCardFront.trim() || !newCardBack.trim()) {
      Alert.alert('❌ Error', 'Please fill in both front and back of the card');
      return;
    }

    try {
      const { data, error } = await flashcardService.addFlashcard(currentDeck.id, {
        front: newCardFront.trim(),
        back: newCardBack.trim(),
        difficulty: 1
      });

      if (error) {
        Alert.alert('❌ Error', 'Failed to add flashcard');
        return;
      }

      setFlashcards(prev => [...prev, data]);
      setNewCardFront('');
      setNewCardBack('');
      setShowAddForm(false);

      Alert.alert('✅ Success', 'Flashcard added successfully!');
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert('❌ Error', 'Failed to add flashcard');
    }
  };

  // Generate flashcards with AI
  const generateWithAI = async () => {
    if (!currentDeck) {
      Alert.alert('❌ Error', 'Please select a deck first');
      return;
    }

    if (!aiInput.trim()) {
      Alert.alert('❌ Error', 'Please enter some study material to generate flashcards');
      return;
    }

    setIsGenerating(true);

    try {
      const aiFlashcards = await generateFlashcardsWithOpenAI(aiInput);

      if (aiFlashcards && Array.isArray(aiFlashcards)) {
        // Save each AI-generated card to the database
        const savedCards = [];
        for (const card of aiFlashcards) {
          const { data, error } = await flashcardService.addFlashcard(currentDeck.id, {
            front: card.front,
            back: card.back,
            difficulty: 1
          });

          if (!error && data) {
            savedCards.push(data);
          }
        }

        if (savedCards.length > 0) {
          setFlashcards(prev => [...prev, ...savedCards]);
          setAiInput('');
          setShowAIGenerator(false);
          Alert.alert('✅ Success', `Generated ${savedCards.length} flashcards!`);
        } else {
          Alert.alert('❌ Error', 'Failed to save AI-generated flashcards');
        }
      } else {
        Alert.alert('❌ Error', 'Failed to generate flashcards with AI');
      }
    } catch (error) {
      console.error('Error generating AI flashcards:', error);
      Alert.alert('❌ Error', 'Failed to generate flashcards with AI');
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete card
  const deleteCard = async (cardId) => {
    Alert.alert(
      '🗑️ Delete Card',
      'Are you sure you want to delete this flashcard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await flashcardService.deleteFlashcard(cardId);

              if (error) {
                Alert.alert('❌ Error', 'Failed to delete flashcard');
                return;
              }

              setFlashcards(prev => prev.filter(card => card.id !== cardId));

              // Adjust current card index if needed
              if (currentCardIndex >= flashcards.length - 1) {
                setCurrentCardIndex(Math.max(0, flashcards.length - 2));
              }

              Alert.alert('✅ Success', 'Flashcard deleted successfully!');
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert('❌ Error', 'Failed to delete flashcard');
            }
          }
        }
      ]
    );
  };

  // Delete deck
  const deleteDeck = async (deckId) => {
    Alert.alert(
      '🗑️ Delete Deck',
      'Are you sure you want to delete this deck? This will also delete all flashcards in it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await flashcardService.deleteDeck(deckId);

              if (error) {
                Alert.alert('❌ Error', 'Failed to delete deck');
                return;
              }

              setDecks(prev => prev.filter(deck => deck.id !== deckId));

              if (currentDeck?.id === deckId) {
                if (decks.length > 1) {
                  const newCurrentDeck = decks.find(deck => deck.id !== deckId);
                  setCurrentDeck(newCurrentDeck);
                  await loadDeckCards(newCurrentDeck.id);
                } else {
                  setCurrentDeck(null);
                  setFlashcards([]);
                  setCurrentCardIndex(0);
                }
              }

              Alert.alert('✅ Success', 'Deck deleted successfully!');
            } catch (error) {
              console.error('Error deleting deck:', error);
              Alert.alert('❌ Error', 'Failed to delete deck');
            }
          }
        }
      ]
    );
  };

  // Navigation functions
  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
    }
  };

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Shuffle cards
  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    flipAnimation.setValue(0);
    Alert.alert('🔀 Shuffled', 'Cards have been shuffled!');
  };

  // Export cards
  const exportCards = () => {
    if (flashcards.length === 0) {
      Alert.alert('❌ Error', 'No cards to export');
      return;
    }

    const exportData = flashcards.map(card => ({
      front: card.front,
      back: card.back
    }));

    const exportText = JSON.stringify(exportData, null, 2);
    Clipboard.setStringAsync(exportText);
    Alert.alert('📋 Exported', 'Flashcards copied to clipboard!');
  };

  // Share deck
  const shareDeck = () => {
    if (!currentDeck) {
      Alert.alert('❌ Error', 'No deck selected');
      return;
    }

    const shareText = `Check out my flashcard deck: ${currentDeck.name}\n\n${flashcards.length} cards\nSubject: ${currentDeck.subject}`;
    Clipboard.setStringAsync(shareText);
    Alert.alert('📤 Shared', 'Deck information copied to clipboard!');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: navTheme.colors.background }]}>
        <Text style={[styles.loadingText, { color: navTheme.colors.text }]}>
          Loading flashcards...
        </Text>
      </View>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  // Show empty state when no flashcards exist
  if (!flashcards || flashcards.length === 0) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: navTheme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: navTheme.colors.text }]}>📚 Flashcards</Text>
          <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>
            No cards yet
          </Text>
        </View>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon, { color: navTheme.colors.text }]}>📝</Text>
          <Text style={[styles.emptyText, { color: navTheme.colors.text }]}>No Flashcards Yet</Text>
          <Text style={[styles.emptySubtext, { color: navTheme.colors.text }]}>
            Start by creating your first deck or adding some flashcards to get started with your studies!
          </Text>

          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
              onPress={() => setShowDeckSelector(true)}
            >
              <Text style={[styles.emptyButtonText, { color: navTheme.colors.text }]}>➕ Create Deck</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
              onPress={() => setShowAIGenerator(true)}
            >
              <Text style={[styles.emptyButtonText, { color: navTheme.colors.text }]}>🤖 Generate with AI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Generator Section */}
        {showAIGenerator && (
          <View style={[styles.aiSection, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>🤖 Generate with AI</Text>
            <TextInput
              style={[styles.aiInput, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
              placeholder="Enter your study material here..."
              placeholderTextColor={navTheme.colors.text}
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

        {/* Deck Selector */}
        {showDeckSelector && (
          <View style={[styles.formSection, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>➕ Create New Deck</Text>
            <TextInput
              style={[styles.input, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
              placeholder="Deck name (e.g., Math Formulas)"
              placeholderTextColor={navTheme.colors.text}
              value={newDeckName}
              onChangeText={setNewDeckName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={navTheme.colors.text}
              value={newDeckDescription}
              onChangeText={setNewDeckDescription}
            />
            <TextInput
              style={[styles.input, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
              placeholder="Subject (e.g., Mathematics)"
              placeholderTextColor={navTheme.colors.text}
              value={newDeckSubject}
              onChangeText={setNewDeckSubject}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={createDeck}>
                <Text style={styles.buttonText}>💾 Create Deck</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setShowDeckSelector(false)}>
                <Text style={styles.buttonText}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: navTheme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: navTheme.colors.text }]}>📚 Flashcards</Text>
        <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>
          Card {currentCardIndex + 1} of {flashcards.length}
        </Text>
      </View>

      {/* AI Generator Section */}
      {showAIGenerator && (
        <View style={[styles.aiSection, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>🤖 Generate with AI</Text>
          <TextInput
            style={[styles.aiInput, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
            placeholder="Enter your study material here..."
            placeholderTextColor={navTheme.colors.text}
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
        <TouchableOpacity
          style={[styles.card, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
          onPress={currentCard ? flipCard : null}
          activeOpacity={currentCard ? 0.9 : 1}
        >
          <Animated.View style={[
            styles.cardContent,
            {
              transform: [{
                rotateY: flipAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg']
                })
              }]
            }
          ]}>
            <Animated.View style={{
              transform: [{
                rotateY: flipAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-180deg']  // Counter-rotate the content to make text appear normal
                })
              }]
            }}>
            <Text style={[styles.cardText, { color: navTheme.colors.text }]}>
              {isFlipped ? currentCard?.back || 'No answer available' : currentCard?.front || 'No question available'}
            </Text>
            </Animated.View>
            <Text style={[styles.flipHint, { color: navTheme.colors.text }]}>
              {isFlipped ? '👆 Tap to see question' : '👆 Tap to see answer'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }, currentCardIndex === 0 && styles.disabledButton]}
          onPress={prevCard}
          disabled={currentCardIndex === 0}
        >
          <Text style={[styles.navButtonText, currentCardIndex === 0 && styles.disabledText]}>◀️</Text>
        </TouchableOpacity>

        <View style={styles.progressIndicator}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentCardIndex + 1) / flashcards.length) * 100}%`,
                  backgroundColor: navTheme.colors.primary || '#6366F1'
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: navTheme.colors.text }]}>
            {currentCardIndex + 1} / {flashcards.length}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }, currentCardIndex === flashcards.length - 1 && styles.disabledButton]}
          onPress={nextCard}
          disabled={currentCardIndex === flashcards.length - 1}
        >
          <Text style={[styles.navButtonText, currentCardIndex === flashcards.length - 1 && styles.disabledText]}>▶️</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.addButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={[styles.buttonText, { color: navTheme.colors.text }]}>➕ Add Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.aiButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
          onPress={() => setShowAIGenerator(true)}
        >
          <Text style={[styles.buttonText, { color: navTheme.colors.text }]}>🤖 Generate with AI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.shuffleButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
          onPress={shuffleCards}
        >
          <Text style={[styles.buttonText, { color: navTheme.colors.text }]}>🔀 Shuffle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.shareButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
          onPress={shareDeck}
        >
          <Text style={[styles.buttonText, { color: navTheme.colors.text }]}>📤 Share Deck</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
          onPress={() => currentCard && deleteCard(currentCard.id)}
          disabled={!currentCard}
        >
          <Text style={[styles.buttonText, { color: navTheme.colors.text }]}>🗑️ Delete Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.exportButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
          onPress={exportCards}
        >
          <Text style={[styles.buttonText, { color: navTheme.colors.text }]}>📁 Export Deck</Text>
        </TouchableOpacity>
      </View>

      {/* Add New Card Form */}
      {showAddForm && (
        <View style={[styles.formSection, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>➕ Add New Card</Text>
          <TextInput
            style={[styles.input, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
            placeholder="Front of card (question/term)"
            placeholderTextColor={navTheme.colors.text}
            value={newCardFront}
            onChangeText={setNewCardFront}
          />
          <TextInput
            style={[styles.input, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
            placeholder="Back of card (answer/definition)"
            placeholderTextColor={navTheme.colors.text}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emptyButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 140,
    alignItems: 'center',
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  card: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cardText: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 22,
    letterSpacing: 0.3,
  },
  flipHint: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  navButton: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 56,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 22,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  disabledText: {
    opacity: 0.3,
  },
  progressIndicator: {
    flex: 1,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flipButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flipButtonText: {
    fontSize: 20,
    color: '#6366F1',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: '48%',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#22C55E',
  },
  aiButton: {
    backgroundColor: '#6366F1',
  },
  shuffleButton: {
    backgroundColor: '#F59E0B',
  },
  shareButton: {
    backgroundColor: '#8B5CF6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  exportButton: {
    backgroundColor: '#06B6D4',
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
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 50,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  aiSection: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  aiInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 100,
  },
  aiButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 100,
  },
});
