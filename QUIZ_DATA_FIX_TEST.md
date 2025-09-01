# Quiz Data Fix Test

## Problem
When creating a quiz slide, the questions were not being saved properly. The backend was returning an empty questions array even though questions were added.

## Root Cause
The `buildQuizData` function in `AlmasCourseCreatePage.tsx` was not properly handling the quiz data format that `SlideEditor` produces.

## Data Format Mismatch

### SlideEditor saves quiz data as:
```json
{
  "quiz": {
    "questions": [
      {
        "id": "1",
        "question": "2 + 2 = ?",
        "options": ["3", "4", "5"],
        "correctAnswer": 1,
        "explanation": ""
      }
    ],
    "shuffle": false,
    "showExplanation": false
  }
}
```

### But buildQuizData expected:
```json
{
  "questions": [
    {
      "prompt": "2 + 2 = ?",
      "options": ["3", "4", "5"],
      "correct_indices": [1]
    }
  ],
  "passing": 100
}
```

## Fix Applied
Updated the `buildQuizData` function to handle the `correctAnswer` field from SlideEditor format:

```typescript
// 3) single correct index field (SlideEditor format)
if (!correct_indices.length && typeof q?.correctAnswer === 'number') {
  correct_indices = [asNumber(q.correctAnswer)];
}
```

## Test Cases

### Test Case 1: SlideEditor Format
Input:
```json
{
  "quiz": {
    "questions": [
      {
        "id": "1",
        "question": "2 + 2 = ?",
        "options": ["3", "4", "5"],
        "correctAnswer": 1
      }
    ]
  }
}
```

Expected Output:
```json
{
  "questions": [
    {
      "prompt": "2 + 2 = ?",
      "options": ["3", "4", "5"],
      "correct_indices": [1]
    }
  ],
  "passing": 100
}
```

### Test Case 2: Legacy Format
Input:
```json
{
  "questions": [
    {
      "prompt": "Choose the vowels",
      "options": ["б", "а", "о"],
      "correct_indices": [1, 2]
    }
  ],
  "passing": 100
}
```

Expected Output:
```json
{
  "questions": [
    {
      "prompt": "Choose the vowels",
      "options": ["б", "а", "о"],
      "correct_indices": [1, 2]
    }
  ],
  "passing": 100
}
```

## Verification Steps
1. Create a new quiz slide
2. Add questions with correct answers
3. Save the slide
4. Check that the backend returns the questions array with data
5. Edit the slide and verify questions are loaded correctly

## Files Modified
- `src/pages/AlmasCourseCreatePage.tsx` - Updated `buildQuizData` function
