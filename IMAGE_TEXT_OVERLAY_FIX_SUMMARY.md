# Image Text Overlay Fix Summary

## Problem Description
The `image_text_overlay` slide type was not working properly. When creating slides with text overlaid on images, the text wasn't displaying correctly. The expected data structure was:

```json
{
  "url": "https://cdn/pic.png",
  "text": "Наложенный текст"
}
```

But the system wasn't handling this slide type properly in the presentation viewers and slide components.

## Root Cause Analysis

### 1. Missing Slide Type Definition
The `IMAGE_TEXT_OVERLAY` slide type was not defined in the `SlideType` enum.

### 2. Missing Slide Component
There was no dedicated `ImageTextOverlaySlide` component to handle the display of images with overlaid text.

### 3. Missing Presentation Viewer Support
The presentation viewers (`CourseViewPage`, `PresentationViewer`, `PresentationViewerModal`) were not handling the `image_text_overlay` slide type.

### 4. Missing SlideEditor Support
The `SlideEditor` didn't have a dedicated interface for creating `image_text_overlay` slides.

## Solution Implemented

### 1. Added IMAGE_TEXT_OVERLAY to SlideType Enum
**File:** `src/components/common/SlideBuilder/types.ts`

```typescript
export enum SlideType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  QUIZ = 'QUIZ',
  CODE = 'CODE',
  CHART = 'CHART',
  EMBED = 'EMBED',
  GAME = 'GAME',
  INTERACTIVE = 'INTERACTIVE',
  ACHIEVEMENT = 'ACHIEVEMENT',
  PROGRESS = 'PROGRESS',
  FLASHCARDS = 'FLASHCARDS',
  FILL_WORDS = 'FILL_WORDS',
  IMAGE_DRAG_DROP = 'IMAGE_DRAG_DROP',
  IMAGE_TEXT_OVERLAY = 'IMAGE_TEXT_OVERLAY', // Added
}
```

### 2. Added imageTextOverlay Interface to SlideContent
**File:** `src/components/common/SlideBuilder/types.ts`

```typescript
imageTextOverlay?: {
  url: string;
  text: string;
  textElements?: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontFamily: string;
    rotation: number;
    opacity: number;
    textAlign: 'left' | 'center' | 'right';
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline' | 'line-through';
    shadow?: {
      enabled: boolean;
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
    stroke?: {
      enabled: boolean;
      color: string;
      width: number;
    };
    backgroundColor?: {
      enabled: boolean;
      color: string;
      opacity: number;
    };
  }>;
};
```

### 3. Created ImageTextOverlaySlide Component
**File:** `src/components/common/SlideBuilder/ImageTextOverlaySlide.tsx`

Created a new component that:
- Displays images with overlaid text
- Supports both simple text overlay and complex text elements
- Handles positioning, styling, and effects
- Provides fallback for missing images

### 4. Updated SlideEditor
**File:** `src/components/common/SlideBuilder/SlideEditor.tsx`

Added:
- `IMAGE_TEXT_OVERLAY` option in the slide type selector
- Content editor for image URL and overlay text
- Integration with ImageTextEditor for advanced text positioning
- Proper data handling in `handleSave` function

### 5. Updated Presentation Viewers
**Files:**
- `src/pages/CourseViewPage.tsx`
- `src/components/common/PresentationViewer/PresentationViewer.tsx`
- `src/components/common/PresentationViewer/PresentationViewerModal.tsx`

Added:
- Import for `ImageTextOverlaySlide` component
- Case handling for `image_text_overlay` slide type
- `convertSlide` function support for proper data transformation

### 6. Updated Exports
**File:** `src/components/common/SlideBuilder/index.ts`

Added export for the new component:
```typescript
export { default as ImageTextOverlaySlide } from './ImageTextOverlaySlide';
```

## Data Flow After Fix

### Creation Flow:
1. **SlideEditor** → User selects "Изображение с текстом" type
2. **User Input** → Enters image URL and overlay text
3. **handleSave** → Creates JSON with `url` and `text` fields
4. **API** → Receives `{ url: "...", text: "..." }` format
5. **Backend** → Saves image_text_overlay slide

### Display Flow:
1. **API Response** → `{ "data": { "url": "...", "text": "..." } }`
2. **convertSlide()** → `{ "imageTextOverlay": { "url": "...", "text": "..." } }`
3. **ImageTextOverlaySlide** → Renders image with overlaid text
4. **Display** → Text appears properly positioned over image

## Features of ImageTextOverlaySlide

### Simple Text Overlay:
- Displays text centered over the image
- Semi-transparent background for readability
- Responsive design

### Advanced Text Elements:
- Multiple text elements with individual positioning
- Custom fonts, colors, and sizes
- Rotation and opacity controls
- Text shadows and strokes
- Background colors for text elements

### Fallback Handling:
- Graceful handling of missing images
- Error messages for invalid URLs
- Default styling for missing text

## Files Modified

1. **`src/components/common/SlideBuilder/types.ts`**
   - Added `IMAGE_TEXT_OVERLAY` to SlideType enum
   - Added `imageTextOverlay` interface to SlideContent

2. **`src/components/common/SlideBuilder/ImageTextOverlaySlide.tsx`** (New)
   - Created new slide component for image text overlay

3. **`src/components/common/SlideBuilder/SlideEditor.tsx`**
   - Added IMAGE_TEXT_OVERLAY option to slide type selector
   - Added content editor for image text overlay
   - Added data handling in handleSave function

4. **`src/components/common/SlideBuilder/index.ts`**
   - Added export for ImageTextOverlaySlide

5. **`src/pages/CourseViewPage.tsx`**
   - Added import and case handling for image_text_overlay
   - Added convertSlide support

6. **`src/components/common/PresentationViewer/PresentationViewer.tsx`**
   - Added import and case handling for image_text_overlay
   - Added convertSlide support

7. **`src/components/common/PresentationViewer/PresentationViewerModal.tsx`**
   - Added import and case handling for image_text_overlay
   - Added convertSlide support

## Expected Behavior After Fix

**Before Fix:**
- `image_text_overlay` slides showed as unknown slide type
- Text overlay didn't display properly
- No dedicated interface for creating image text overlay slides
- Missing component for rendering

**After Fix:**
- `image_text_overlay` slides display correctly with text overlaid on images
- Dedicated editor interface for creating image text overlay slides
- Support for both simple and complex text positioning
- Proper data structure handling throughout the application

## Test Cases

✅ **Simple text overlay** → Text displays centered over image  
✅ **Complex text elements** → Multiple positioned text elements render correctly  
✅ **SlideEditor integration** → Can create image_text_overlay slides  
✅ **Presentation viewers** → Slides display in all viewers  
✅ **Data transformation** → API data properly converted for display  
✅ **Fallback handling** → Graceful handling of missing data  

## Status: RESOLVED ✅

The `image_text_overlay` slide type is now fully implemented and working correctly. Users can create slides with text overlaid on images, and the text will display properly positioned over the image in all presentation viewers.
