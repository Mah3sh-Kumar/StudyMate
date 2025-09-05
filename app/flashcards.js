import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  Animated, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useThemePreference } from '../contexts/ThemeContext';
import { generateFlashcardsWithOpenAI } from '../api/api';
import { flashcardService } from '../lib/mockData';
import { useAuth } from '../contexts/AuthContext';

export default function FlashcardsScreen() {
  const { colors } = useThemePreference();
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
  const [deckCreating, setDeckCreating] = useState(false);
  const [cardAdding, setCardAdding] = useState(false);

  // Load user's decks on component mount
  useEffect(() => {
    if (user) {
      loadUserDecks();
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
    // Enhanced validation
    if (!newDeckName.trim()) {
      Alert.alert('❌ Validation Error', 'Please enter a deck name');
      return;
    }

    if (newDeckName.trim().length < 3) {
      Alert.alert('❌ Validation Error', 'Deck name must be at least 3 characters long');
      return;
    }

    if (newDeckName.trim().length > 50) {
      Alert.alert('❌ Validation Error', 'Deck name must be less than 50 characters');
      return;
    }

    try {
      setDeckCreating(true);
      
      const { data, error } = await flashcardService.createDeck(user.id, {
        name: newDeckName.trim(),
        description: newDeckDescription.trim(),
        subject: newDeckSubject.trim() || 'General',
        isPublic: false
      });
      
      if (error) {
        Alert.alert('❌ Error', 'Failed to create deck: ' + error.message);
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
      
      Alert.alert('✅ Success', `Deck "${data.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating deck:', error);
      Alert.alert('❌ Error', 'An unexpected error occurred while creating the deck');
    } finally {
      setDeckCreating(false);
    }
  };

  // Add new card to current deck
  const addCard = async () => {
    if (!currentDeck) {
      Alert.alert('❌ Error', 'Please select a deck first');
      return;
    }

    // Enhanced validation
    if (!newCardFront.trim() || !newCardBack.trim()) {
      Alert.alert('❌ Validation Error', 'Please fill in both front and back of the card');
      return;
    }

    if (newCardFront.trim().length < 5) {
      Alert.alert('❌ Validation Error', 'Question must be at least 5 characters long');
      return;
    }

    if (newCardBack.trim().length < 2) {
      Alert.alert('❌ Validation Error', 'Answer must be at least 2 characters long');
      return;
    }

    if (newCardFront.trim().length > 500) {
      Alert.alert('❌ Validation Error', 'Question must be less than 500 characters');
      return;
    }

    if (newCardBack.trim().length > 1000) {
      Alert.alert('❌ Validation Error', 'Answer must be less than 1000 characters');
      return;
    }

    try {
      setCardAdding(true);
      
      const { data, error } = await flashcardService.addCard(currentDeck.id, {
        front: newCardFront.trim(),
        back: newCardBack.trim(),
        difficulty: 1
      });
      
      if (error) {
        Alert.alert('❌ Error', 'Failed to add flashcard: ' + error.message);
        return;
      }
      
      setFlashcards(prev => [...prev, data]);
      setNewCardFront('');
      setNewCardBack('');
      setShowAddForm(false);
      
      Alert.alert('✅ Success', 'Flashcard added successfully!');
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert('❌ Error', 'An unexpected error occurred while adding the card');
    } finally {
      setCardAdding(false);
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
          const { data, error } = await flashcardService.addCard(currentDeck.id, {
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading flashcards...
        </Text>
      </View>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  // Show empty state when no flashcards exist
  if (!flashcards || flashcards.length === 0) {
    return (
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={[styles.container, { backgroundColor: colors.background }]} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>📚 Flashcards</Text>
          <Text style={[styles.subtitle, { color: colors.text, opacity: 0.8 }]}>
            No cards yet
          </Text>
        </View>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon, { color: colors.text, opacity: 0.7 }]}>📝</Text>
          <Text style={[styles.emptyText, { color: colors.text }]}>No Flashcards Yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.text, opacity: 0.7 }]}>
            Start by creating your first deck or adding some flashcards to get started with your studies!
          </Text>
          
          <View style={styles.emptyActions}>
            <TouchableOpacity 
              style={[styles.emptyButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => setShowDeckSelector(true)}
            >
              <Text style={[styles.emptyButtonText, { color: colors.text }]}>➕ Create Deck</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.emptyButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => setShowAIGenerator(true)}
            >
              <Text style={[styles.emptyButtonText, { color: colors.text }]}>🤖 Generate with AI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Generator Section */}
        {showAIGenerator && (
          <View style={[styles.aiSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🤖 Generate with AI</Text>
            <TextInput
              style={[styles.aiInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter your study material here..."
              placeholderTextColor={colors.text + '80'}
              value={aiInput}
              onChangeText={setAiInput}
              multiline
              numberOfLines={4}
            />
            <View style={styles.aiButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.generateButton, { backgroundColor: colors.primary }]} 
                onPress={generateWithAI}
                disabled={isGenerating}
              >
                <Text style={styles.buttonText}>
                  {isGenerating ? '🔄 Generating...' : '🚀 Generate Cards'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.notification }]} 
                onPress={() => setShowAIGenerator(false)}
              >
                <Text style={styles.buttonText}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Deck Selector */}
        {showDeckSelector && (
          <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>➕ Create New Deck</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Deck name (e.g., Math Formulas)"
              placeholderTextColor={colors.text + '80'}
              value={newDeckName}
              onChangeText={setNewDeckName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.text + '80'}
              value={newDeckDescription}
              onChangeText={setNewDeckDescription}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Subject (e.g., Mathematics)"
              placeholderTextColor={colors.text + '80'}
              value={newDeckSubject}
              onChangeText={setNewDeckSubject}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]} onPress={createDeck}>
                <Text style={styles.buttonText}>💾 Create Deck</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton, { backgroundColor: colors.notification }]} onPress={() => setShowDeckSelector(false)}>
                <Text style={styles.buttonText}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>📚 Flashcards</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Card {currentCardIndex + 1} of {flashcards.length}
        </Text>
      </View>

      {/* AI Generator Section */}
      {showAIGenerator && (
        <View style={[styles.aiSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🤖 Generate with AI</Text>
          <TextInput
            style={[styles.aiInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter your study material here..."



            
            placeholderTextColor={colors.text + '80'}
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
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.notification }]} 
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
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
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
            <Text style={[styles.cardText, { color: colors.text }]}>
            {isFlipped ? currentCard?.back || 'No answer available' : currentCard?.front || 'No question available'}
          </Text>
            <Text style={[styles.flipHint, { color: colors.text, opacity: 0.6 }]}>
            {isFlipped ? '👆 Tap to see question' : '👆 Tap to see answer'}
          </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.navButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={prevCard} 
          disabled={currentCardIndex === 0}
        >
          <Text style={[styles.navButtonText, { color: colors.primary }, currentCardIndex === 0 && { opacity: 0.3 }]}>◀</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.flipButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={flipCard}
        >
          <Text style={[styles.flipButtonText, { color: colors.primary }]}>🔄</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={nextCard} 
          disabled={currentCardIndex === flashcards.length - 1}
        >
          <Text style={[styles.navButtonText, { color: colors.primary }, currentCardIndex === flashcards.length - 1 && { opacity: 0.3 }]}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={() => setShowAddForm(true)}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>➕ Add Card</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.aiButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={() => setShowAIGenerator(true)}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>🤖 Generate with AI</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.shuffleButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={shuffleCards}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>🔀 Shuffle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.shareButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={shareDeck}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>📤 Share Deck</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={() => currentCard && deleteCard(currentCard.id)}
          disabled={!currentCard}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>🗑️ Delete Card</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.exportButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={exportCards}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>📁 Export Deck</Text>
        </TouchableOpacity>
      </View>

      {/* AI Generator Section */}
      {showAIGenerator && (
        <View style={[styles.aiSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🤖 Generate with AI</Text>
          <TextInput
            style={[styles.aiInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter your study material here..."
            placeholderTextColor={colors.text + '80'}
            value={aiInput}
            onChangeText={setAiInput}
            multiline
            numberOfLines={4}
          />
          <View style={styles.aiButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.generateButton, { backgroundColor: colors.primary }]} 
              onPress={generateWithAI}
              disabled={isGenerating}
            >
              <Text style={styles.buttonText}>
                {isGenerating ? '🔄 Generating...' : '🚀 Generate Cards'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.notification }]} 
              onPress={() => setShowAIGenerator(false)}
            >
              <Text style={styles.buttonText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Add New Card Form */}
      {showAddForm && (
        <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>➕ Add New Card</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Question (front of card)"
            placeholderTextColor={colors.text + '80'}
            value={newCardFront}
            onChangeText={setNewCardFront}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Answer (back of card)"
            placeholderTextColor={colors.text + '80'}
            value={newCardBack}
            onChangeText={setNewCardBack}
            multiline
            numberOfLines={3}
            maxLength={1000}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton, { backgroundColor: colors.primary, opacity: cardAdding ? 0.6 : 1 }]} 
              onPress={addCard}
              disabled={cardAdding}
            >
              <Text style={styles.buttonText}>
                {cardAdding ? '🔄 Saving...' : '💾 Save Card'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.notification }]} 
              onPress={() => setShowAddForm(false)}
              disabled={cardAdding}
            >
              <Text style={styles.buttonText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Deck Management Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={() => setShowDeckSelector(true)}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>📚 New Deck</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.exportButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={exportCards}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>📋 Export</Text>
        </TouchableOpacity>
      </View>

      {/* Deck Selector */}
      {showDeckSelector && (
        <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📚 Manage Decks</Text>
          
          {/* Current Deck Info */}
          {currentDeck && (
            <View style={styles.currentDeckInfo}>
              <Text style={[styles.currentDeckName, { color: colors.text }]}>
                Current: {currentDeck.name}
              </Text>
              <Text style={[styles.currentDeckDetails, { color: colors.text, opacity: 0.7 }]}>
                {currentDeck.subject} • {flashcards.length} cards
              </Text>
            </View>
          )}
          
          {/* Deck List */}
          <Text style={[styles.deckListTitle, { color: colors.text }]}>Switch Deck:</Text>
          {decks.map(deck => (
            <TouchableOpacity 
              key={deck.id}
              style={[
                styles.deckItem, 
                { backgroundColor: colors.background, borderColor: colors.border },
                currentDeck?.id === deck.id && styles.currentDeckItem
              ]}
              onPress={async () => {
                setCurrentDeck(deck);
                await loadDeckCards(deck.id);
                setShowDeckSelector(false);
              }}
            >
              <Text style={[styles.deckName, { color: colors.text }]}>{deck.name}</Text>
              <Text style={[styles.deckDetails, { color: colors.text, opacity: 0.7 }]}>
                {deck.subject} • {deck.total_cards || 0} cards
              </Text>
              <TouchableOpacity 
                style={styles.deleteDeckButton}
                onPress={() => deleteDeck(deck.id)}
              >
                <Text style={styles.deleteDeckText}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          
          {/* Create New Deck Form */}
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>➕ Create New Deck</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Deck name (e.g., Math Formulas)"
            placeholderTextColor={colors.text + '80'}
            value={newDeckName}
            onChangeText={setNewDeckName}
            maxLength={50}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.text + '80'}
            value={newDeckDescription}
            onChangeText={setNewDeckDescription}
            maxLength={200}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Subject (e.g., Mathematics)"
            placeholderTextColor={colors.text + '80'}
            value={newDeckSubject}
            onChangeText={setNewDeckSubject}
            maxLength={50}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton, { backgroundColor: colors.primary, opacity: deckCreating ? 0.6 : 1 }]} 
              onPress={createDeck}
              disabled={deckCreating}
            >
              <Text style={styles.buttonText}>
                {deckCreating ? '🔄 Creating...' : '💾 Create Deck'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.notification }]} 
              onPress={() => setShowDeckSelector(false)}
              disabled={deckCreating}
            >
              <Text style={styles.buttonText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
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
    height: 300,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    padding: 20,
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
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 20,
  },
  flipHint: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  navButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  disabledText: {
    opacity: 0.3,
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
    // No background color - will be set via theme
  },
  aiButton: {
    // No background color - will be set via theme
  },
  shuffleButton: {
    // No background color - will be set via theme
  },
  shareButton: {
    // No background color - will be set via theme
  },
  deleteButton: {
    // No background color - will be set via theme
  },
  exportButton: {
    // No background color - will be set via theme
  },
  generateButton: {
    // No background color - will be set via theme
  },
  cancelButton: {
    // No background color - will be set via theme
  },
  saveButton: {
    // No background color - will be set via theme
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  currentDeckInfo: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 102, 255, 0.1)',
  },
  currentDeckName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentDeckDetails: {
    fontSize: 14,
  },
  deckListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  deckItem: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentDeckItem: {
    backgroundColor: 'rgba(102, 102, 255, 0.2)',
  },
  deckName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  deckDetails: {
    fontSize: 12,
    flex: 2,
    textAlign: 'right',
  },
  deleteDeckButton: {
    padding: 8,
  },
  deleteDeckText: {
    fontSize: 16,
  },
});
}