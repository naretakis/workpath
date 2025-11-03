# Implementation Tasks: WorkPath - Document Management

**Capture and Store Verification Documents**

---

## Task Overview

This task list breaks down the document management feature into discrete, manageable steps. Each task builds on previous work and produces working, integrated code.

**Total: 8 sections, 28 tasks**

---

- [x] 1. Database Schema and Data Models

- [x] 1.1 Define TypeScript interfaces for documents
  - Create `src/types/documents.ts`
  - Define `Document` interface with all metadata fields
  - Define `DocumentBlob` interface
  - Define `DocumentType` enum
  - Export types

- [x] 1.2 Update IndexedDB schema with document tables
  - Modify `src/lib/storage/db.ts`
  - Add `documents` table with indexes (++id, activityId, type, createdAt)
  - Add `documentBlobs` table with index (++id)
  - Increment database version to 2
  - Add upgrade function (no data migration needed)
  - Test database creation in browser DevTools

- [x] 1.3 Create document storage operations
  - Create `src/lib/storage/documents.ts`
  - Implement `saveDocument(activityId, blob, metadata)` function
  - Implement `getDocumentsByActivity(activityId)` function
  - Implement `getDocument(documentId)` function
  - Implement `deleteDocument(documentId)` function
  - Implement `getDocumentBlob(blobId)` function
  - Add error handling for all operations

- [x] 1.4 Create Zod validation schemas
  - Create `src/lib/validation/documents.ts`
  - Define `documentMetadataSchema` with Zod
  - Add validation for document type
  - Add validation for description (max 200 chars)
  - Add validation for file size
  - Export schemas

---

- [ ] 2. Image Compression Utility

- [ ] 2.1 Implement image compression function
  - Create `src/lib/utils/imageCompression.ts`
  - Implement `compressImage(file, maxSizeMB, quality)` function
  - Load image using FileReader
  - Create canvas and resize to max 1920px
  - Compress to JPEG with 0.8 quality
  - Return compressed blob
  - Add progress callback support

- [ ] 2.2 Add file validation utilities
  - Add `validateFileType(file)` function (JPEG/PNG only)
  - Add `validateFileSize(file, maxMB)` function
  - Add `formatFileSize(bytes)` function for display
  - Add error messages for validation failures

- [ ] 2.3 Test compression with various image sizes
  - Test with small images (< 1MB)
  - Test with medium images (1-5MB)
  - Test with large images (5-10MB)
  - Verify compression reduces size
  - Verify quality is acceptable

---

## 3. Camera Capture Component

- [ ] 3.1 Create camera hook
  - Create `src/hooks/useCamera.ts`
  - Implement `requestCameraPermission()` function
  - Implement `openCamera()` function using getUserMedia
  - Handle permission denied errors
  - Handle camera not found errors
  - Return camera stream and error state

- [ ] 3.2 Build CameraCapture component
  - Create `src/components/documents/CameraCapture.tsx`
  - Add video element for camera preview
  - Add capture button
  - Add retake/confirm buttons
  - Implement photo capture to canvas
  - Convert canvas to blob
  - Handle camera permission errors with clear messages
  - Test on mobile device

- [ ] 3.3 Add camera availability detection
  - Check if `navigator.mediaDevices` exists
  - Check if `getUserMedia` is supported
  - Hide camera button if not available
  - Show file upload as only option if camera unavailable

---

## 4. File Upload Component

- [ ] 4.1 Build FileUpload component
  - Create `src/components/documents/FileUpload.tsx`
  - Add file input with `accept="image/jpeg,image/png"`
  - Add drag-and-drop zone
  - Implement file selection handler
  - Validate file type on selection
  - Validate file size on selection
  - Show error messages for invalid files
  - Display file preview after selection

- [ ] 4.2 Add upload progress indicator
  - Show loading spinner during file read
  - Show compression progress if needed
  - Display final file size

---

## 5. Document Metadata Form

- [ ] 5.1 Build DocumentMetadataForm component
  - Create `src/components/documents/DocumentMetadataForm.tsx`
  - Add document type selector (dropdown)
  - Add custom type input (shown when "other" selected)
  - Add description textarea (optional, max 200 chars)
  - Display linked activity info (read-only)
  - Add character counter for description
  - Integrate React Hook Form with Zod validation

- [ ] 5.2 Implement form submission
  - Validate all fields on submit
  - Show validation errors inline
  - Call `saveDocument()` on valid submission
  - Handle save errors
  - Show success message
  - Close form and return to activity view

---

## 6. Activity Form Integration

- [ ] 6.1 Add document capture to ActivityForm
  - Modify `src/components/tracking/ActivityForm.tsx`
  - Add camera button (if available)
  - Add upload button
  - Open CameraCapture or FileUpload on button click
  - Handle captured/uploaded image
  - Trigger image compression if needed
  - Open DocumentMetadataForm after image ready
  - Link document to activity on save

- [ ] 6.2 Show attached documents in activity form
  - Display count of attached documents
  - Show document thumbnails
  - Allow viewing full-size documents
  - Allow deleting documents

---

## 7. Document Display Components

- [ ] 7.1 Build DocumentThumbnails component
  - Create `src/components/documents/DocumentThumbnails.tsx`
  - Query documents for given activity
  - Display thumbnails in grid layout
  - Show document type label on each thumbnail
  - Add loading state
  - Add empty state (no documents)
  - Make thumbnails tappable to view full-size

- [ ] 7.2 Build DocumentThumbnail component
  - Create `src/components/documents/DocumentThumbnail.tsx`
  - Load document blob
  - Create object URL for display
  - Show thumbnail image
  - Show document type badge
  - Add loading skeleton
  - Clean up object URL on unmount

- [ ] 7.3 Build DocumentViewer component
  - Create `src/components/documents/DocumentViewer.tsx`
  - Display full-screen modal
  - Load and display full-size image
  - Add pinch-to-zoom support (consider using `react-zoom-pan-pinch`)
  - Display document metadata below image
  - Add close button
  - Add delete button with confirmation
  - Handle delete action

- [ ] 7.4 Update ActivityList to show document indicators
  - Modify `src/components/tracking/ActivityList.tsx`
  - Query document count for each activity
  - Display document icon if count > 0
  - Show document count (e.g., "2 documents")
  - Make indicator tappable to view activity details

- [ ] 7.5 Update ActivityCard component
  - Modify `src/components/tracking/ActivityCard.tsx`
  - Add document icon and count display
  - Style document indicator

---

## 8. Storage Quota Monitoring

- [ ] 8.1 Create storage quota hook
  - Create `src/hooks/useStorageQuota.ts`
  - Implement `navigator.storage.estimate()` call
  - Calculate usage percentage
  - Poll every 60 seconds
  - Return usage, quota, and percentage

- [ ] 8.2 Build StorageWarning component
  - Create `src/components/settings/StorageWarning.tsx`
  - Display warning banner when usage > 80%
  - Show current usage and available space
  - Link to storage management in settings
  - Make dismissible (but show again if still over threshold)

- [ ] 8.3 Build StorageInfo component
  - Create `src/components/settings/StorageInfo.tsx`
  - Display total storage usage
  - Display available storage quota
  - Show breakdown by type (documents, activities, profile)
  - Calculate and display document count
  - Calculate and display total document size
  - Show list of documents sorted by size (largest first)
  - Add bulk delete option for old documents

- [ ] 8.4 Add storage warning to app layout
  - Modify `src/app/layout.tsx` or main layout component
  - Add StorageWarning component at top
  - Only show when usage > 80%

- [ ] 8.5 Add storage info to settings page
  - Modify `src/app/settings/page.tsx`
  - Add StorageInfo component
  - Add section header "Storage Management"

---

## 9. Error Handling and Edge Cases

- [ ] 9.1 Handle camera permission errors
  - Show clear error message when permission denied
  - Provide instructions to enable camera in settings
  - Offer file upload as alternative
  - Test on iOS Safari and Android Chrome

- [ ] 9.2 Handle storage quota exceeded
  - Check quota before saving document
  - Show error if insufficient space
  - Suggest deleting old documents
  - Prevent save if quota exceeded

- [ ] 9.3 Handle file too large errors
  - Show error if file > 10MB after compression
  - Suggest taking a new photo
  - Provide clear error message

- [ ] 9.4 Handle activity deletion with documents
  - When activity is deleted, also delete linked documents
  - Delete both metadata and blobs
  - Update storage calculations

---

## 10. Testing and Polish

- [ ] 10.1 Test camera capture on mobile devices
  - Test on iOS Safari
  - Test on Android Chrome
  - Verify camera opens correctly
  - Verify photos are captured
  - Verify compression works

- [ ] 10.2 Test file upload on all browsers
  - Test on Chrome, Firefox, Safari, Edge
  - Verify file picker opens
  - Verify drag-and-drop works
  - Verify validation works

- [ ] 10.3 Test document viewing and deletion
  - Verify thumbnails display correctly
  - Verify full-size viewer works
  - Verify zoom works
  - Verify delete removes both metadata and blob

- [ ] 10.4 Test storage monitoring
  - Verify quota calculation is accurate
  - Verify warning appears at 80%
  - Verify storage breakdown is correct

- [ ] 10.5 Test offline functionality
  - Verify all features work offline
  - Verify documents persist across sessions
  - Verify no network errors

- [ ] 10.6 Polish UI and UX
  - Ensure all buttons have proper touch targets (44px+)
  - Add loading states where needed
  - Add empty states where needed
  - Ensure error messages are clear and helpful
  - Test on small screens (320px width)

---

## Implementation Notes

### Order of Implementation

1. **Start with data layer** (Tasks 1.x) - Get database and types set up first
2. **Build utilities** (Tasks 2.x) - Compression and validation
3. **Build capture components** (Tasks 3.x, 4.x) - Camera and upload
4. **Build metadata form** (Task 5.x) - Document details
5. **Integrate with activities** (Task 6.x) - Link to existing flow
6. **Build display components** (Task 7.x) - View documents
7. **Add storage monitoring** (Task 8.x) - Prevent quota issues
8. **Handle errors** (Task 9.x) - Edge cases
9. **Test and polish** (Task 10.x) - Final QA

### Testing Strategy

- Test on real mobile devices early and often
- Camera API behavior varies significantly between browsers
- iOS Safari has limitations with camera access in PWAs
- Test with various image sizes and formats
- Monitor IndexedDB storage usage in DevTools

### Performance Considerations

- Load document blobs lazily (only when needed)
- Use object URLs for image display (clean up after use)
- Compress images > 5MB automatically
- Consider pagination if user has many documents

### Common Pitfalls

- Camera permission must be requested from user gesture
- iOS Safari may require file input with `capture` attribute instead of getUserMedia
- Large blobs can cause memory issues; clean up object URLs
- IndexedDB has generous limits but can still fill up with many large images

---

## Success Criteria

This feature is complete when:

- ✅ Users can capture photos with device camera
- ✅ Users can upload photos from device storage
- ✅ Images > 5MB are automatically compressed
- ✅ Documents are linked to activities
- ✅ Document thumbnails display in activity list
- ✅ Full-size document viewer works with zoom
- ✅ Documents can be deleted
- ✅ Storage quota is monitored and warnings shown
- ✅ All functionality works offline
- ✅ Works on iOS Safari and Android Chrome

---

## Estimated Time

- **Tasks 1-2**: 1-2 days (data layer and utilities)
- **Tasks 3-4**: 2-3 days (camera and upload)
- **Task 5**: 1 day (metadata form)
- **Task 6**: 1-2 days (activity integration)
- **Task 7**: 2-3 days (display components)
- **Task 8**: 1-2 days (storage monitoring)
- **Tasks 9-10**: 2-3 days (error handling and testing)

**Total: 10-16 days** (2-3 weeks part-time)

---

## Dependencies

- Existing activity tracking functionality
- IndexedDB (Dexie.js)
- Material-UI components
- React Hook Form and Zod
- Camera API (MediaDevices)
- Canvas API (for compression)

---

## Optional Enhancements (Future)

- Document editing (crop, rotate)
- OCR text extraction
- PDF support
- Document categories/tags
- Bulk document operations
- Document expiration dates
