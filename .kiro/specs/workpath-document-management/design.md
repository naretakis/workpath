# Design Document: HourKeep - Document Management

**Capture and Store Verification Documents**

---

## Overview

This design adds document capture, storage, and viewing capabilities to HourKeep. Users can photograph or upload verification documents (pay stubs, volunteer letters, etc.) and link them directly to their logged activities. All documents are stored locally in IndexedDB with automatic compression for large images.

**Key Design Principles:**

- **Activity-Centric**: Documents are always linked to activities (captured during activity entry)
- **Mobile-First**: Optimized for phone cameras and touch interfaces
- **Storage-Conscious**: Automatic compression and quota monitoring
- **Offline-First**: All functionality works without internet
- **Simple UX**: Minimal steps from capture to storage

---

## Architecture

### High-Level Flow

```
Activity Entry → Document Capture → Compression → Metadata → Storage → Display
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Activity Entry Flow                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ActivityForm                                           │
│  ├─ Activity fields (type, hours, org)                 │
│  └─ Document capture button                            │
│      │                                                   │
│      ├─ CameraCapture (if supported)                   │
│      │   └─ MediaDevices API                           │
│      │                                                   │
│      └─ FileUpload (fallback/alternative)              │
│          └─ File input                                  │
│                                                          │
│  ↓                                                       │
│                                                          │
│  ImageProcessor                                         │
│  ├─ Validate file type (JPEG/PNG)                      │
│  ├─ Check file size                                     │
│  ├─ Compress if > 5MB                                   │
│  └─ Generate preview                                    │
│                                                          │
│  ↓                                                       │
│                                                          │
│  DocumentMetadataForm                                   │
│  ├─ Document type selector                             │
│  ├─ Description (optional)                             │
│  └─ Linked activity (auto-filled)                      │
│                                                          │
│  ↓                                                       │
│                                                          │
│  DocumentStorage                                        │
│  ├─ Store blob in documentBlobs table                  │
│  ├─ Store metadata in documents table                  │
│  └─ Link to activity                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   Document Viewing Flow                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ActivityList                                           │
│  └─ Activity with document indicator                   │
│      │                                                   │
│      ↓                                                   │
│                                                          │
│  ActivityDetail                                         │
│  └─ Document thumbnails                                │
│      │                                                   │
│      ↓                                                   │
│                                                          │
│  DocumentViewer                                         │
│  ├─ Full-size image with zoom                          │
│  ├─ Document metadata                                   │
│  └─ Delete button                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Data Models

### Document Metadata

```typescript
interface Document {
  id?: number; // Auto-increment ID
  activityId: number; // Foreign key to activities table
  type: DocumentType; // Enum: pay-stub, volunteer-verification, etc.
  customType?: string; // If type is "other"
  description?: string; // Optional description (max 200 chars)
  originalFileName?: string; // Original file name
  fileSize: number; // Size in bytes
  compressedSize?: number; // Size after compression (if compressed)
  mimeType: string; // image/jpeg or image/png
  captureMethod: "camera" | "upload"; // How document was added
  createdAt: Date; // When document was created
  blobId: number; // Foreign key to documentBlobs table
}

type DocumentType =
  | "pay-stub"
  | "volunteer-verification"
  | "school-enrollment"
  | "medical-documentation"
  | "other";
```

### Document Blob

```typescript
interface DocumentBlob {
  id?: number; // Auto-increment ID
  blob: Blob; // The actual image data
  createdAt: Date; // When blob was stored
}
```

### Updated Activity Model

```typescript
interface Activity {
  id?: number;
  date: string;
  type: "work" | "volunteer" | "education";
  hours: number;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
  documentCount?: number; // Computed: count of linked documents
}
```

---

## Database Schema (IndexedDB)

```typescript
class HourKeepDB extends Dexie {
  profiles!: Table<UserProfile>;
  activities!: Table<Activity>;
  documents!: Table<Document>; // NEW
  documentBlobs!: Table<DocumentBlob>; // NEW

  constructor() {
    super("HourKeepDB");

    // Version 2: Add document tables
    this.version(2).stores({
      profiles: "id",
      activities: "++id, date, type",
      documents: "++id, activityId, type, createdAt", // NEW
      documentBlobs: "++id", // NEW
    });
  }
}
```

**Indexes:**

- `documents`: Auto-increment `id`, indexed on `activityId`, `type`, `createdAt`
- `documentBlobs`: Auto-increment `id` only (blobs are large, minimize indexes)

**Why Separate Tables?**

- Blobs are large; separating allows querying metadata without loading blobs
- Can list documents quickly without loading image data
- Easier to implement thumbnail generation in future

---

## Key Features Implementation

### 1. Camera Capture

**Flow:**

1. User taps camera button in activity form
2. Check if camera is available (`navigator.mediaDevices.getUserMedia`)
3. Request camera permission if not granted
4. Open camera interface (native or custom)
5. User takes photo
6. Display preview with retake/confirm options
7. On confirm, proceed to image processing

**Code Location:**

- Component: `src/components/documents/CameraCapture.tsx`
- Hook: `src/hooks/useCamera.ts`

**Implementation Notes:**

- Use `getUserMedia({ video: { facingMode: "environment" } })` for rear camera
- Handle permission denied gracefully (show error, offer file upload)
- iOS Safari has limitations; may need to use file input with `capture="environment"`
- Consider using a library like `react-webcam` for cross-browser compatibility

---

### 2. File Upload

**Flow:**

1. User taps upload button in activity form
2. Open file picker with `accept="image/jpeg,image/png"`
3. User selects file
4. Validate file type and size
5. Display preview
6. Proceed to image processing

**Code Location:**

- Component: `src/components/documents/FileUpload.tsx`

**Implementation Notes:**

- Use `<input type="file" accept="image/jpeg,image/png" />`
- Validate MIME type on client side
- Show clear error for unsupported formats
- Consider adding drag-and-drop for desktop users

---

### 3. Image Compression

**Flow:**

1. Receive image file (from camera or upload)
2. Check file size
3. If > 5MB, compress using Canvas API
4. Display compression progress
5. Show final file size to user
6. Reject if still > 10MB after compression

**Code Location:**

- Utility: `src/lib/utils/imageCompression.ts`

**Implementation:**

```typescript
async function compressImage(
  file: File,
  maxSizeMB: number = 5,
  quality: number = 0.8,
): Promise<Blob> {
  // Load image
  const img = await loadImage(file);

  // Create canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Calculate dimensions (maintain aspect ratio)
  let { width, height } = img;
  const maxDimension = 1920; // Max width or height

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = (height / width) * maxDimension;
      width = maxDimension;
    } else {
      width = (width / height) * maxDimension;
      height = maxDimension;
    }
  }

  canvas.width = width;
  canvas.height = height;

  // Draw and compress
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", quality);
  });
}
```

**Compression Strategy:**

- Resize to max 1920px on longest side
- Use JPEG with 0.8 quality
- If still > 10MB, reject (extremely rare)

---

### 4. Document Metadata Form

**Flow:**

1. After image processing, show metadata form
2. Pre-fill activity date (read-only)
3. User selects document type
4. If "other", show custom type input
5. User optionally enters description
6. User saves

**Code Location:**

- Component: `src/components/documents/DocumentMetadataForm.tsx`

**UI Design:**

```
┌─────────────────────────────────────┐
│  Add Document                       │
├─────────────────────────────────────┤
│                                     │
│  [Image Preview]                    │
│                                     │
│  Document Type *                    │
│  ┌─────────────────────────────┐   │
│  │ Pay Stub                ▼   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Description (optional)             │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  For Activity: March 15, 2024       │
│  (Work - 8 hours)                   │
│                                     │
│  [Cancel]  [Save Document]          │
│                                     │
└─────────────────────────────────────┘
```

---

### 5. Document Storage

**Flow:**

1. User saves document
2. Check storage quota
3. If quota low, show warning
4. Store blob in `documentBlobs` table
5. Store metadata in `documents` table with `blobId` reference
6. Update activity to increment `documentCount`
7. Show success message
8. Return to activity form

**Code Location:**

- Storage: `src/lib/storage/documents.ts`
- Hook: `src/hooks/useDocuments.ts`

**Implementation:**

```typescript
async function saveDocument(
  activityId: number,
  blob: Blob,
  metadata: Omit<Document, "id" | "blobId" | "createdAt">,
): Promise<number> {
  const db = getDatabase();

  // Check storage quota
  const quota = await navigator.storage.estimate();
  const available = (quota.quota || 0) - (quota.usage || 0);

  if (available < 50 * 1024 * 1024) {
    // Less than 50MB available
    throw new Error("Low storage space");
  }

  // Store blob
  const blobId = await db.documentBlobs.add({
    blob,
    createdAt: new Date(),
  });

  // Store metadata
  const documentId = await db.documents.add({
    ...metadata,
    activityId,
    blobId,
    createdAt: new Date(),
  });

  return documentId;
}
```

---

### 6. Document Display in Activity List

**Flow:**

1. Query activities for current month
2. For each activity, count linked documents
3. Display document icon with count if > 0
4. User taps activity to see details

**Code Location:**

- Component: `src/components/tracking/ActivityList.tsx`
- Component: `src/components/tracking/ActivityCard.tsx`

**UI Design:**

```
┌─────────────────────────────────────┐
│  March 15, 2024                     │
│  ┌───────────────────────────────┐ │
│  │ Work - 8 hours                │ │
│  │ ABC Company                   │ │
│  │ 📄 2 documents                │ │
│  └───────────────────────────────┘ │
│                                     │
│  March 16, 2024                     │
│  ┌───────────────────────────────┐ │
│  │ Volunteer - 4 hours           │ │
│  │ Food Bank                     │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### 7. Document Thumbnails in Activity Detail

**Flow:**

1. User taps activity with documents
2. Query documents for that activity
3. Load document blobs
4. Generate thumbnails (or display small versions)
5. Display in grid
6. User taps thumbnail to view full-size

**Code Location:**

- Component: `src/components/documents/DocumentThumbnails.tsx`
- Component: `src/components/documents/DocumentThumbnail.tsx`

**UI Design:**

```
┌─────────────────────────────────────┐
│  Activity Details                   │
├─────────────────────────────────────┤
│  Work - 8 hours                     │
│  ABC Company                        │
│  March 15, 2024                     │
│                                     │
│  Documents (2)                      │
│  ┌─────────┐  ┌─────────┐          │
│  │ [thumb] │  │ [thumb] │          │
│  │ Pay Stub│  │ Pay Stub│          │
│  └─────────┘  └─────────┘          │
│                                     │
│  [Edit Activity]  [Delete]          │
└─────────────────────────────────────┘
```

---

### 8. Full-Size Document Viewer

**Flow:**

1. User taps document thumbnail
2. Load full-size blob
3. Display in modal/full-screen viewer
4. Support pinch-to-zoom
5. Show metadata below image
6. Provide delete button

**Code Location:**

- Component: `src/components/documents/DocumentViewer.tsx`

**UI Design:**

```
┌─────────────────────────────────────┐
│  [X]                                │
│                                     │
│                                     │
│      [Full-size image]              │
│      (pinch to zoom)                │
│                                     │
│                                     │
│  ─────────────────────────────────  │
│  Pay Stub                           │
│  March 15, 2024                     │
│  Work at ABC Company                │
│                                     │
│  [Delete Document]                  │
└─────────────────────────────────────┘
```

**Implementation Notes:**

- Use `react-zoom-pan-pinch` or similar library for zoom
- Consider using `react-modal` for full-screen display
- Ensure image loads progressively for large files

---

### 9. Storage Quota Monitoring

**Flow:**

1. Check storage quota periodically (every minute)
2. Calculate usage percentage
3. If > 80%, show warning banner
4. Display storage details in settings

**Code Location:**

- Hook: `src/hooks/useStorageQuota.ts`
- Component: `src/components/settings/StorageWarning.tsx`
- Component: `src/components/settings/StorageInfo.tsx`

**Implementation:**

```typescript
function useStorageQuota() {
  const [quota, setQuota] = useState<{
    usage: number;
    quota: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    async function checkQuota() {
      const estimate = await navigator.storage.estimate();
      setQuota({
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100,
      });
    }

    checkQuota();
    const interval = setInterval(checkQuota, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  return quota;
}
```

**Storage Breakdown:**

```typescript
async function getStorageBreakdown() {
  const db = getDatabase();

  // Count documents
  const documentCount = await db.documents.count();

  // Calculate document blob sizes
  const blobs = await db.documentBlobs.toArray();
  const documentSize = blobs.reduce((sum, b) => sum + b.blob.size, 0);

  // Estimate other data (activities, profile)
  const activityCount = await db.activities.count();
  const otherSize = activityCount * 200; // Rough estimate

  return {
    documents: {
      count: documentCount,
      size: documentSize,
    },
    activities: {
      count: activityCount,
      size: otherSize,
    },
    total: documentSize + otherSize,
  };
}
```

---

## User Interface Components

### New Components

1. **CameraCapture.tsx**
   - Opens device camera
   - Captures photo
   - Shows preview with retake/confirm

2. **FileUpload.tsx**
   - File input with drag-and-drop
   - File type validation
   - Preview display

3. **DocumentMetadataForm.tsx**
   - Document type selector
   - Description input
   - Activity info display

4. **DocumentThumbnails.tsx**
   - Grid of document thumbnails
   - Document count display
   - Tap to view full-size

5. **DocumentThumbnail.tsx**
   - Single thumbnail with type label
   - Loading state
   - Error state

6. **DocumentViewer.tsx**
   - Full-screen image display
   - Pinch-to-zoom support
   - Metadata display
   - Delete button

7. **StorageWarning.tsx**
   - Warning banner when storage low
   - Link to storage management

8. **StorageInfo.tsx**
   - Storage usage visualization
   - Breakdown by type
   - Document list with sizes

### Modified Components

1. **ActivityForm.tsx**
   - Add camera/upload buttons
   - Handle document capture flow
   - Show attached documents

2. **ActivityList.tsx**
   - Display document indicators
   - Show document count

3. **ActivityCard.tsx**
   - Add document icon
   - Show document count

4. **Settings.tsx**
   - Add storage info section
   - Add storage warning (if needed)

---

## File Structure

```
src/
├── components/
│   ├── documents/
│   │   ├── CameraCapture.tsx          # NEW
│   │   ├── FileUpload.tsx             # NEW
│   │   ├── DocumentMetadataForm.tsx   # NEW
│   │   ├── DocumentThumbnails.tsx     # NEW
│   │   ├── DocumentThumbnail.tsx      # NEW
│   │   └── DocumentViewer.tsx         # NEW
│   ├── settings/
│   │   ├── StorageWarning.tsx         # NEW
│   │   └── StorageInfo.tsx            # NEW
│   └── tracking/
│       ├── ActivityForm.tsx           # MODIFIED
│       ├── ActivityList.tsx           # MODIFIED
│       └── ActivityCard.tsx           # MODIFIED
├── hooks/
│   ├── useCamera.ts                   # NEW
│   ├── useDocuments.ts                # NEW
│   └── useStorageQuota.ts             # NEW
├── lib/
│   ├── storage/
│   │   ├── db.ts                      # MODIFIED (add tables)
│   │   └── documents.ts               # NEW
│   └── utils/
│       └── imageCompression.ts        # NEW
└── types/
    └── documents.ts                   # NEW
```

---

## Error Handling

### Camera Permission Denied

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  // Use stream
} catch (error) {
  if (error.name === "NotAllowedError") {
    showError(
      "Camera access denied. Please enable camera access in your device settings, or use the upload option instead.",
    );
  } else if (error.name === "NotFoundError") {
    showError("No camera found on this device. Please use the upload option.");
  } else {
    showError("Unable to access camera. Please try again.");
  }
}
```

### Storage Quota Exceeded

```typescript
try {
  await saveDocument(activityId, blob, metadata);
} catch (error) {
  if (error.message === "Low storage space") {
    showError(
      "Storage space is running low. Please delete some old documents to free up space.",
    );
  } else {
    showError("Unable to save document. Please try again.");
  }
}
```

### File Too Large

```typescript
if (compressedBlob.size > 10 * 1024 * 1024) {
  showError(
    "This image is too large (over 10MB). Please try a different photo.",
  );
  return;
}
```

---

## Performance Considerations

### Image Loading

- Load thumbnails lazily (only when scrolled into view)
- Use `loading="lazy"` on img tags
- Consider generating actual thumbnails (smaller blobs) in future

### Database Queries

- Index `activityId` for fast document lookups
- Avoid loading blobs when only metadata is needed
- Use `db.documents.where('activityId').equals(id).toArray()` for efficient queries

### Memory Management

- Release blob URLs after use: `URL.revokeObjectURL(url)`
- Don't keep large blobs in memory longer than needed
- Consider pagination for document lists if user has many documents

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Camera capture works on iOS Safari
- [ ] Camera capture works on Android Chrome
- [ ] File upload works on all browsers
- [ ] Images > 5MB are compressed
- [ ] Compressed images are < 10MB
- [ ] Documents are linked to correct activities
- [ ] Thumbnails display correctly
- [ ] Full-size viewer works with zoom
- [ ] Delete removes both metadata and blob
- [ ] Storage warning appears at 80%
- [ ] Storage info shows correct breakdown
- [ ] Works offline

### Edge Cases

- Camera permission denied
- No camera available
- Invalid file type uploaded
- File too large (> 10MB after compression)
- Storage quota exceeded
- Activity deleted with documents attached
- Multiple documents on same activity

---

## Migration Strategy

### Database Migration

```typescript
// In db.ts
this.version(2)
  .stores({
    profiles: "id",
    activities: "++id, date, type",
    documents: "++id, activityId, type, createdAt", // NEW
    documentBlobs: "++id", // NEW
  })
  .upgrade((tx) => {
    // No data migration needed for new tables
    console.log("Added document tables");
  });
```

### Existing Users

- No data migration needed (new tables are empty)
- Existing activities work as before
- Users can start adding documents immediately

---

## Future Enhancements

**Phase 2 (Not in this spec):**

- Document filtering and search
- Document categories/tags
- Bulk document operations
- Document expiration dates
- OCR for text extraction
- PDF support
- Document sharing

**Phase 3:**

- Thumbnail generation (actual smaller images)
- Image editing (crop, rotate, adjust)
- Document templates
- Automatic document type detection

---

## Success Metrics

This design is successful when:

- ✅ Users can capture documents in < 10 seconds
- ✅ 95% of images compress to < 1MB
- ✅ Storage quota warnings prevent out-of-space errors
- ✅ Document viewing is smooth (no lag)
- ✅ Works reliably offline
- ✅ Camera permission errors are handled gracefully

---

## Notes

- Camera API support varies; always provide file upload fallback
- iOS Safari requires user gesture to access camera (can't auto-open)
- Consider using a library like `react-webcam` for better cross-browser support
- Image compression is CPU-intensive; show progress indicator
- IndexedDB has generous storage limits (usually 50% of available disk space)
- Blobs in IndexedDB are efficient (no base64 encoding overhead)
