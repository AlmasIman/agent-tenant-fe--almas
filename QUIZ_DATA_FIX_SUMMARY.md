# Quiz Data Fix Summary

## Problem Description
When creating quiz slides, the questions were not being saved properly. The backend was returning an empty questions array even though questions were added.

**Example Payload Sent:**
```json
{
  "id": 51,
  "name": "New Slide",
  "type": "quiz",
  "data": {
    "questions": [
      { "prompt": "2 + 2 = ?", "options": ["3", "4", "5"], "correct_indices": [1] },
      { "prompt": "Choose the vowels", "options": ["б", "а", "о"], "correct_indices": [1, 2] }
    ],
    "passing": 100
  },
  "order": 3,
  "presentation": 27
}
```

**Backend Response (Before Fix):**
```json
{
  "id": 51,
  "name": "New Slide",
  "type": "quiz",
  "data": {
    "questions": [],
    "passing": 100
  },
  "order": 3,
  "presentation": 27
}
```

## Root Cause Analysis

### 1. Data Format Mismatch
The `buildQuizData` function in `AlmasCourseCreatePage.tsx` was not properly handling the quiz data format that `SlideEditor` produces.

**SlideEditor Format:**
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
    ]
  }
}
```

**Expected API Format:**
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

### 2. Multiple Correct Answers Issue
The SlideEditor was only handling single correct answers, but the API expected support for multiple correct answers.

## Fixes Applied

### 1. Updated `buildQuizData` Function
**File:** `src/pages/AlmasCourseCreatePage.tsx`

Added support for the `correctAnswer` field from SlideEditor format:

```typescript
// 3) single correct index field (SlideEditor format)
if (!correct_indices.length && typeof q?.correctAnswer === 'number') {
  correct_indices = [asNumber(q.correctAnswer)];
}
```

### 2. Enhanced SlideEditor for Multiple Correct Answers
**File:** `src/components/common/SlideBuilder/SlideEditor.tsx`

Updated the quiz data processing to handle multiple correct answers:

```typescript
// Handle multiple correct answers
const correctIndices = question.options
  .map((option: any, optionIndex: number) => option.correct ? optionIndex : -1)
  .filter((index: number) => index !== -1);

return {
  id: (index + 1).toString(),
  question: question.question || '',
  options: question.options.map((option: any) => option.text || ''),
  correctAnswer: correctIndices.length > 0 ? correctIndices[0] : 0, // For backward compatibility
  correct_indices: correctIndices, // For new format
  explanation: question.explanation || '',
};
```

### 3. Fixed TypeScript Error
**File:** `src/components/common/SlideBuilder/SlideEditor.tsx`

Fixed metadata type compatibility issue:

```typescript
metadata: {
  ...currentSlide.metadata,
  createdAt: currentSlide.metadata?.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
```

## Test Results

The fix was verified with a test script that confirmed:

1. **SlideEditor Format Test:** ✅ Passed
   - Input: 2 questions with `correctAnswer` field
   - Output: 2 questions with `correct_indices` field
   - Questions count: 2 (expected: 2)

2. **Legacy Format Test:** ✅ Passed
   - Input: 1 question with `correct_indices` field
   - Output: 1 question with `correct_indices` field
   - Questions count: 1 (expected: 1)

## Backward Compatibility

The fix maintains backward compatibility by:
- Supporting both `correctAnswer` (single) and `correct_indices` (multiple) formats
- Preserving existing API contracts
- Not breaking existing quiz data

## Files Modified

1. `src/pages/AlmasCourseCreatePage.tsx`
   - Updated `buildQuizData` function to handle SlideEditor format
   - Added support for `correctAnswer` field

2. `src/components/common/SlideBuilder/SlideEditor.tsx`
   - Enhanced quiz data processing for multiple correct answers
   - Fixed TypeScript metadata type issue
   - Added `correct_indices` field support

## Verification Steps

To verify the fix works:

1. Create a new quiz slide
2. Add questions with single or multiple correct answers
3. Save the slide
4. Check that the backend returns the questions array with data
5. Edit the slide and verify questions are loaded correctly
6. Test with both single and multiple correct answers

## Expected Behavior After Fix

**Backend Response (After Fix):**
```json
{
  "id": 51,
  "name": "New Slide",
  "type": "quiz",
  "data": {
    "questions": [
      { "prompt": "2 + 2 = ?", "options": ["3", "4", "5"], "correct_indices": [1] },
      { "prompt": "Choose the vowels", "options": ["б", "а", "о"], "correct_indices": [1, 2] }
    ],
    "passing": 100
  },
  "order": 3,
  "presentation": 27
}
```

The questions array will now contain the actual quiz data instead of being empty.
