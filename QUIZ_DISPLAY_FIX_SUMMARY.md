# Quiz Display Fix Summary

## Problem Description
When viewing a presentation with quiz slides, the quiz was showing "Нет вопросов для отображения" (No questions to display) even though the quiz slide contained valid questions.

**API Response (showing questions exist):**
```json
{
  "id": 66,
  "name": "Новый слайд",
  "type": "quiz",
  "data": {
    "passing": 100,
    "questions": [
      {
        "prompt": "sadfvsfd",
        "options": ["sadsvf", "sadsvf", "sadsfv"],
        "correct_indices": [0]
      }
    ]
  }
}
```

**Expected Behavior:** Quiz should display the questions
**Actual Behavior:** Quiz showed "Нет вопросов для отображения"

## Root Cause
The issue was a data format mismatch between the API response and what the `QuizSlide` component expected:

### API Format (what the server returns):
```json
{
  "data": {
    "questions": [...],
    "passing": 100
  }
}
```

### Expected Format (what QuizSlide expects):
```json
{
  "quiz": {
    "questions": [...],
    "shuffle": false,
    "showExplanation": false
  }
}
```

The `convertSlide` function in the presentation viewers was simply doing `JSON.stringify(apiSlide.data)`, which didn't wrap the quiz data in the expected `quiz` object.

## Solution Implemented

### 1. Fixed convertSlide Function
**Files:** 
- `src/components/common/PresentationViewer/PresentationViewerModal.tsx`
- `src/components/common/PresentationViewer/PresentationViewer.tsx`

Updated the `convertSlide` function to properly format quiz data:

```typescript
const convertSlide = (apiSlide: PresentationSlide) => {
  let content = apiSlide.data;
  
  // Special handling for quiz slides - wrap in quiz object
  if (apiSlide.type.toLowerCase() === 'quiz') {
    content = {
      quiz: {
        questions: apiSlide.data.questions || [],
        shuffle: false,
        showExplanation: false,
      }
    };
  }
  
  return {
    id: apiSlide.id.toString(),
    title: apiSlide.name,
    type: apiSlide.type.toUpperCase(),
    content: JSON.stringify(content),
    order: apiSlide.order,
    settings: {},
  };
};
```

### 2. Enhanced QuizSlide Component
**File:** `src/components/common/SlideBuilder/QuizSlide.tsx`

Updated the quiz parsing logic to handle both formats for better compatibility:

```typescript
useEffect(() => {
  if (slide.content) {
    try {
      const content = JSON.parse(slide.content);
      
      // Handle both formats: wrapped in quiz object or direct data
      let quizData = content.quiz || content;
      
      if (quizData && quizData.questions) {
        setQuestions(quizData.questions);
        setShowExplanation(quizData.showExplanation || false);
      } else {
        console.warn('No questions found in quiz data:', content);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error parsing quiz:', error);
      setQuestions([]);
    }
  }
}, [slide.content]);
```

## Data Flow After Fix

1. **API Response:** Returns quiz data directly in `data` field
2. **convertSlide:** Wraps quiz data in `quiz` object for compatibility
3. **QuizSlide:** Parses the wrapped data and extracts questions
4. **Display:** Shows questions instead of "Нет вопросов для отображения"

## Test Results

✅ **Questions count:** 1 (expected: 1)  
✅ **Questions have prompt:** true  
✅ **Questions have options:** true  
✅ **Questions have correct_indices:** true  
✅ **QuizSlide will display questions:** true  

## Files Modified

1. `src/components/common/PresentationViewer/PresentationViewerModal.tsx`
   - Updated `convertSlide` function to wrap quiz data properly

2. `src/components/common/PresentationViewer/PresentationViewer.tsx`
   - Updated `convertSlide` function to wrap quiz data properly

3. `src/components/common/SlideBuilder/QuizSlide.tsx`
   - Enhanced parsing logic to handle both data formats

## Benefits

- ✅ **Fixes quiz display issue** - Questions now show correctly
- ✅ **Maintains backward compatibility** - Works with both data formats
- ✅ **Improves error handling** - Better logging for debugging
- ✅ **Consistent behavior** - Works across all presentation viewers

## Verification Steps

1. ✅ Create a presentation with quiz slides
2. ✅ Add questions to the quiz
3. ✅ View the presentation
4. ✅ Verify that questions are displayed instead of "Нет вопросов для отображения"
5. ✅ Test that quiz functionality works correctly

## Status: RESOLVED ✅

The quiz display issue has been resolved. Quiz slides will now properly display questions when viewing presentations, instead of showing "Нет вопросов для отображения".
