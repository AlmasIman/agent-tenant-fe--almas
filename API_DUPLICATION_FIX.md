# API Duplication Fix

## Problem
When viewing presentations in training mode, the API endpoint `https://aigent.kz/api/kb/articles/3/` was being called twice, causing duplicate requests and potential performance issues.

## Root Cause
The issue was caused by `React.StrictMode` being enabled in development mode. React StrictMode intentionally double-invokes effects, constructors, and other functions to help detect side effects. This caused API calls in `useEffect` hooks to be made twice.

## Solution
Instead of removing React.StrictMode (which is useful for catching bugs), we implemented a deduplication hook that prevents duplicate API calls within a specified time window.

### 1. Created `useApiCall` Hook
Located at `src/hooks/useApiCall.ts`, this hook:
- Wraps API functions to prevent duplicate calls
- Uses a ref to track ongoing promises
- Allows configuration of deduplication time window
- Can be disabled if needed

### 2. Updated Components
The following components were updated to use the deduplication hook:

- `src/pages/CourseViewPage.tsx` - Training page with KB article loading
- `src/components/common/PresentationViewer/PresentationViewerModal.tsx` - Presentation viewer
- `src/pages/Kb/components/KbArticle.tsx` - KB article component
- `src/pages/CourseQuizPage.tsx` - Course quiz page

### 3. Usage Example
```typescript
// Before
const { data } = await httpApi.get(`/kb/articles/${id}/`);

// After
const getKbArticle = useApiCall(httpApi.get, { deduplicate: true, deduplicateTime: 2000 });
const { data } = await getKbArticle(`/kb/articles/${id}/`);
```

## Benefits
- Prevents duplicate API calls in development mode
- Maintains React.StrictMode benefits
- Improves performance by reducing unnecessary network requests
- Configurable deduplication window
- Backward compatible - can be disabled per API call

## Configuration
The deduplication hook accepts the following options:
- `deduplicate`: boolean (default: true) - Enable/disable deduplication
- `deduplicateTime`: number (default: 1000ms) - Time window for deduplication

## Testing
To verify the fix works:
1. Open browser developer tools
2. Navigate to Network tab
3. View a presentation in training mode
4. Verify that API calls are not duplicated
