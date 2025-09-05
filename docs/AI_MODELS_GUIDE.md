# AI Models Configuration Guide for StudyMate

## Overview

StudyMate now uses different OpenAI models optimized for specific tasks, ensuring the best performance and cost-effectiveness for each feature.

## Model Assignments by Feature

### 🗣️ **Chat & Conversation** - GPT-4o
- **Location**: `app/(tabs)/chat.js`
- **Model**: `gpt-4o`
- **Use Case**: Real-time conversation, complex reasoning, study assistance
- **Configuration**: 
  - Max tokens: 2000
  - Temperature: 0.3
  - Best for: Interactive learning, answering complex questions

### 📝 **Text Analysis & Summarization** - GPT-4o-mini
- **Location**: `app/(tabs)/summarizer.js`
- **Model**: `gpt-4o-mini`
- **Use Case**: Text analysis, summarization, content processing
- **Configuration**:
  - Max tokens: 1500
  - Temperature: 0.2
  - Best for: Cost-effective text processing

### 🎯 **Content Generation** - GPT-3.5-turbo-1106
- **Location**: `app/(tabs)/quiz.js`, `app/(tabs)/flashcards.js`
- **Model**: `gpt-3.5-turbo-1106`
- **Use Case**: Structured content generation (quizzes, flashcards)
- **Configuration**:
  - Max tokens: 1000
  - Temperature: 0.1
  - Best for: Reliable JSON output, structured data

### 🎨 **Image Generation** - DALL-E 3
- **Location**: Any feature requiring visual content
- **Model**: `dall-e-3`
- **Use Case**: Educational illustrations, concept visualization
- **Configuration**:
  - Size: 1024x1024
  - Quality: standard/hd
  - Style: natural/vivid
  - Best for: Creating educational visuals

### 🎤 **Audio Transcription** - Whisper
- **Location**: `app/(tabs)/handsfree.js`
- **Model**: `whisper-1`
- **Use Case**: Speech-to-text, audio note transcription
- **Configuration**:
  - Response format: text
  - Language: auto-detect or specified
  - Best for: Converting voice notes to text

## Configuration Files

### 1. `config/api-config.js`
Contains all model configurations and settings:

```javascript
OPENAI: {
  MODELS: {
    CHAT: { model: 'gpt-4o', max_tokens: 2000, temperature: 0.3 },
    ANALYSIS: { model: 'gpt-4o-mini', max_tokens: 1500, temperature: 0.2 },
    GENERATION: { model: 'gpt-3.5-turbo-1106', max_tokens: 1000, temperature: 0.1 },
    IMAGE: { model: 'dall-e-3', size: '1024x1024' },
    AUDIO: { model: 'whisper-1', response_format: 'text' }
  }
}
```

### 2. `api/api.js`
Contains the API functions that use these models:

```javascript
// Chat with GPT-4o
export const getAIChatResponse = async (messages) => { ... }

// Summarize with GPT-4o-mini
export const summarizeTextWithOpenAI = async (text) => { ... }

// Generate quiz with GPT-3.5-turbo-1106
export const generateQuizWithOpenAI = async (text) => { ... }

// Generate image with DALL-E 3
export const generateImageWithOpenAI = async (prompt, options) => { ... }

// Transcribe audio with Whisper
export const transcribeAudioWithOpenAI = async (audioFile, options) => { ... }
```

## Usage Examples

### Chat Feature
```javascript
import { getAIChatResponse } from '../api/api';

const response = await getAIChatResponse([
  { role: 'user', content: 'Explain quantum physics in simple terms' }
]);
// Uses GPT-4o for best conversation quality
```

### Summarization Feature
```javascript
import { summarizeTextWithOpenAI } from '../api/api';

const summary = await summarizeTextWithOpenAI(longText);
// Uses GPT-4o-mini for cost-effective analysis
```

### Quiz Generation
```javascript
import { generateQuizWithOpenAI } from '../api/api';

const quiz = await generateQuizWithOpenAI(studyMaterial);
// Uses GPT-3.5-turbo-1106 for reliable JSON output
```

### Image Generation
```javascript
import { generateImageWithOpenAI } from '../api/api';

const imageUrl = await generateImageWithOpenAI('DNA structure', {
  size: '1024x1024',
  quality: 'hd',
  style: 'natural'
});
// Uses DALL-E 3 for high-quality educational images
```

### Audio Transcription
```javascript
import { transcribeAudioWithOpenAI } from '../api/api';

const text = await transcribeAudioWithOpenAI(audioFile, {
  language: 'en',
  prompt: 'This is a lecture about biology'
});
// Uses Whisper for high-quality transcription
```

## Cost Optimization

### High-Cost Models (Use Sparingly)
- **GPT-4o**: Best quality, highest cost - Use for complex conversations
- **DALL-E 3**: Image generation - Use only when visual content is essential

### Medium-Cost Models (Balanced Use)
- **GPT-4o-mini**: Good quality, moderate cost - Use for text analysis

### Low-Cost Models (Use Freely)
- **GPT-3.5-turbo-1106**: Reliable, low cost - Use for structured generation
- **Whisper**: Audio transcription - Use for voice notes

## Customization

### Adding New Models
1. Add model configuration to `config/api-config.js`
2. Create corresponding API function in `api/api.js`
3. Update the feature to use the new function

### Modifying Existing Models
1. Update the model configuration in `config/api-config.js`
2. Adjust parameters like `max_tokens`, `temperature`, etc.
3. Test the changes in the corresponding feature

### Environment-Specific Settings
```javascript
// Development vs Production
if (process.env.NODE_ENV === 'development') {
  // Use cheaper models for testing
  MODELS.CHAT.model = 'gpt-3.5-turbo-1106';
} else {
  // Use premium models for production
  MODELS.CHAT.model = 'gpt-4o';
}
```

## Best Practices

1. **Use the Right Model**: Match the model to the task requirements
2. **Optimize Token Usage**: Set appropriate `max_tokens` for each use case
3. **Control Temperature**: Lower for structured output, higher for creative responses
4. **Monitor Costs**: Track API usage and costs for each model
5. **Fallback Models**: Have backup models for critical features
6. **Error Handling**: Implement proper error handling for API failures

## Troubleshooting

### Common Issues
- **Model Not Available**: Check if the model name is correct and available in your OpenAI account
- **Rate Limits**: Implement retry logic for rate limit errors
- **Token Limits**: Adjust `max_tokens` if responses are being cut off
- **Cost Overruns**: Monitor usage and set appropriate limits

### Debug Mode
```javascript
// Enable debug logging
console.log('Using model:', getModelConfig('CHAT'));
console.log('API response:', response);
```

## Security Notes

- Never expose API keys in client-side code
- Use environment variables for sensitive configuration
- Implement proper authentication and rate limiting
- Monitor API usage for unusual patterns

## Support

For issues with specific models or configurations, check:
1. OpenAI API documentation
2. Model availability in your OpenAI account
3. Rate limits and quotas
4. Network connectivity and API endpoints
