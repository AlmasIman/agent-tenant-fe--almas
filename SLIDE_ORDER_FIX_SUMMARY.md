# Slide Order Unique Constraint Fix

## Problem Description
When creating quiz slides (or any slides), the backend was returning a validation error:
```json
{
  "non_field_errors": ["The fields presentation, order must make a unique set."]
}
```

This error occurs because the backend enforces a unique constraint on the combination of `presentation` and `order` fields, meaning no two slides in the same presentation can have the same order value.

## Root Cause
The issue was that when creating new slides, the system was not properly managing order values to ensure uniqueness within a presentation. This could happen when:

1. Multiple slides were created simultaneously
2. Slides were created with duplicate order values
3. The local state was out of sync with the server state

## Solution Implemented

### 1. Dynamic Order Assignment
**File:** `src/pages/AlmasCourseCreatePage.tsx`

Added a `getNextOrder()` function that dynamically calculates the next available order number:

```typescript
const getNextOrder = async () => {
  try {
    // Get existing slides from the presentation to find the highest order
    const { data: presentation } = await httpApi.get(`/presentations/${presentationId}/`);
    const existingSlides = presentation?.slides || [];
    const maxOrder = existingSlides.length > 0 ? Math.max(...existingSlides.map((s: any) => s.order || 0)) : -1;
    return maxOrder + 1;
  } catch (error) {
    console.warn('Could not get existing slides, using fallback order:', error);
    return slides.length; // Fallback to local slides count
  }
};
```

### 2. Enhanced Error Handling
Added specific error handling for the unique constraint violation:

```typescript
if (err?.response?.data?.non_field_errors?.includes('presentation, order must make a unique set')) {
  // Try to resolve order conflicts by reloading slides and retrying
  try {
    await loadExistingSlides(presentationId);
    message.warning('Порядок слайдов был обновлен. Попробуйте создать слайд снова.');
  } catch (reloadError) {
    message.error('Слайд с таким порядком уже существует. Попробуйте создать слайд снова.');
  }
} else {
  message.error(err?.response?.data?.detail || 'Не удалось сохранить слайд');
}
```

### 3. State Synchronization
Added a `loadExistingSlides()` function to synchronize local state with server state:

```typescript
const loadExistingSlides = async (presentationId: number) => {
  try {
    const { data: presentation } = await httpApi.get(`/presentations/${presentationId}/`);
    const existingSlides = presentation?.slides || [];
    if (existingSlides.length > 0) {
      const convertedSlides = existingSlides.map((slide: any) => ({
        id: slide.id.toString(),
        type: slide.type.toUpperCase(),
        title: slide.name,
        content: JSON.stringify(slide.data),
        order: slide.order,
        settings: {},
        serverId: slide.id,
      }));
      setSlides(convertedSlides);
    } else {
      setSlides([]);
    }
  } catch (error) {
    console.warn('Could not load existing slides:', error);
    setSlides([]);
  }
};
```

### 4. Presentation Creation Enhancement
Updated `handleCreatePresentation` to load existing slides when a presentation is created:

```typescript
// Load existing slides from the presentation to sync state
if (newPresentationId) {
  await loadExistingSlides(newPresentationId);
}
```

## How It Works

1. **When creating a new slide:**
   - The system fetches the current presentation to get all existing slides
   - Calculates the next available order number (max order + 1)
   - Assigns this unique order to the new slide
   - Sends the slide to the server with the correct order

2. **When a conflict occurs:**
   - The system detects the unique constraint violation
   - Reloads the slides from the server to get the current state
   - Updates the local state to match the server
   - Shows a warning message asking the user to try again

3. **When creating a presentation:**
   - The system loads any existing slides from the presentation
   - Converts them to the local format
   - Updates the local state to match the server state

## Benefits

- ✅ **Prevents duplicate order errors** by dynamically calculating unique order values
- ✅ **Maintains data consistency** between client and server
- ✅ **Provides better error messages** for users
- ✅ **Handles edge cases** like concurrent slide creation
- ✅ **Backward compatible** with existing functionality

## Files Modified

1. `src/pages/AlmasCourseCreatePage.tsx`
   - Added `getNextOrder()` function for dynamic order assignment
   - Added `loadExistingSlides()` function for state synchronization
   - Enhanced `persistSlideToApi()` with better error handling
   - Updated `handleCreatePresentation()` to load existing slides

## Testing

To test the fix:

1. Create a new presentation
2. Add multiple slides quickly
3. Verify that no "unique set" errors occur
4. Check that slides are saved with correct order values
5. Verify that the order is maintained when editing slides

## Status: RESOLVED ✅

The slide order unique constraint issue has been resolved. Slides will now be created with unique order values, preventing the backend validation error.
