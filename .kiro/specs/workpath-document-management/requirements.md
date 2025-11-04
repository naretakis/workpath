# Requirements Document: HourKeep - Document Management

**Capture and Store Verification Documents**

---

## Introduction

This feature adds document capture and storage capabilities to HourKeep, allowing users to photograph and store verification documents (pay stubs, volunteer letters, school enrollment) directly from their mobile device and link them to their logged activities.

## Glossary

- **Document**: A photograph or image file stored locally that serves as verification for work activities
- **Document Type**: Category of document (pay stub, volunteer verification, school enrollment, medical documentation, other)
- **Document Blob**: The actual image file data stored in IndexedDB
- **Document Metadata**: Information about the document (type, date, description, linked activity)
- **Camera API**: Browser API that provides access to device camera
- **Image Compression**: Process of reducing file size while maintaining acceptable quality

---

## Requirements

### Requirement 1: Capture Document with Camera

**User Story:** As a user, I want to take a photo of my verification document using my phone's camera, so I can store proof of my work activities.

#### Acceptance Criteria

1. WHEN I am logging an activity THEN THE System SHALL display a camera button option
2. WHEN I tap the camera button THEN THE System SHALL request camera permission if not already granted
3. WHEN camera permission is granted THEN THE System SHALL open the device camera interface
4. WHEN I take a photo THEN THE System SHALL display a preview of the captured image
5. WHEN I view the preview THEN THE System SHALL provide options to retake or confirm the photo
6. WHEN I confirm the photo THEN THE System SHALL proceed to document metadata entry

---

### Requirement 2: Upload Document from Device

**User Story:** As a user, I want to upload an existing photo from my device, so I can attach documents I've already photographed.

#### Acceptance Criteria

1. WHEN I am logging an activity THEN THE System SHALL display an upload button option
2. WHEN I tap the upload button THEN THE System SHALL open the device file picker
3. WHEN I select an image file THEN THE System SHALL validate the file type is JPEG or PNG
4. WHEN the file type is invalid THEN THE System SHALL display an error message with supported formats
5. WHEN the file is valid THEN THE System SHALL display a preview of the uploaded image
6. WHEN I view the preview THEN THE System SHALL proceed to document metadata entry

---

### Requirement 3: Add Document Metadata

**User Story:** As a user, I want to describe what type of document I'm uploading, so I can organize my verification documents.

#### Acceptance Criteria

1. WHEN I confirm a photo or upload THEN THE System SHALL display a document metadata form
2. WHEN viewing the form THEN THE System SHALL provide a document type selector with options: pay stub, volunteer verification, school enrollment, medical documentation, other
3. WHEN I select "other" as document type THEN THE System SHALL display a text field to specify the custom type
4. WHEN viewing the form THEN THE System SHALL provide an optional description field (max 200 characters)
5. WHEN viewing the form THEN THE System SHALL display the date of the linked activity (pre-filled, read-only)
6. WHEN I save the document THEN THE System SHALL validate all required fields are completed

---

### Requirement 4: Store Documents Locally

**User Story:** As a user, I want my documents stored securely on my device, so my verification proof is always available offline.

#### Acceptance Criteria

1. WHEN I save a document THEN THE System SHALL store the image blob in IndexedDB
2. WHEN I save a document THEN THE System SHALL store the document metadata in IndexedDB
3. WHEN I save a document THEN THE System SHALL link the document to the associated activity by activity ID
4. WHEN storing a document THEN THE System SHALL check available storage quota
5. WHEN storage quota is below 50MB available THEN THE System SHALL display a warning before saving
6. WHEN storage quota is insufficient THEN THE System SHALL prevent saving and display an error message

---

### Requirement 5: Compress Large Images

**User Story:** As a user, I want large photos automatically compressed, so I don't run out of storage space quickly.

#### Acceptance Criteria

1. WHEN I capture or upload an image THEN THE System SHALL check the file size
2. WHEN the file size exceeds 5MB THEN THE System SHALL automatically compress the image
3. WHEN compressing an image THEN THE System SHALL use 0.8 quality setting for JPEG compression
4. WHEN compressing an image THEN THE System SHALL display a progress indicator
5. WHEN compression is complete THEN THE System SHALL display the final file size to the user
6. WHEN the compressed file still exceeds 10MB THEN THE System SHALL reject the file and display an error

---

### Requirement 6: View Documents Linked to Activities

**User Story:** As a user, I want to see which documents are attached to my activities, so I know what verification I have.

#### Acceptance Criteria

1. WHEN I view an activity in the activity list THEN THE System SHALL display a document icon if documents are attached
2. WHEN I view an activity with documents THEN THE System SHALL show a count of attached documents (e.g., "2 documents")
3. WHEN I tap on an activity with documents THEN THE System SHALL display thumbnail previews of attached documents
4. WHEN I tap a document thumbnail THEN THE System SHALL open the full-size document viewer
5. WHEN viewing a document THEN THE System SHALL display the document metadata (type, description, date)

---

### Requirement 7: View Full-Size Documents

**User Story:** As a user, I want to view my documents in full size, so I can verify the details are readable.

#### Acceptance Criteria

1. WHEN I tap a document thumbnail THEN THE System SHALL open a full-screen document viewer
2. WHEN viewing a document THEN THE System SHALL display the image at full resolution
3. WHEN viewing a document THEN THE System SHALL support pinch-to-zoom gestures
4. WHEN viewing a document THEN THE System SHALL display document metadata below the image
5. WHEN viewing a document THEN THE System SHALL provide a close button to return to the activity view
6. WHEN viewing a document THEN THE System SHALL provide a delete button with confirmation

---

### Requirement 8: Delete Documents

**User Story:** As a user, I want to delete documents I no longer need, so I can free up storage space.

#### Acceptance Criteria

1. WHEN I view a document THEN THE System SHALL display a delete button
2. WHEN I tap the delete button THEN THE System SHALL display a confirmation dialog
3. WHEN I confirm deletion THEN THE System SHALL remove the document blob from IndexedDB
4. WHEN I confirm deletion THEN THE System SHALL remove the document metadata from IndexedDB
5. WHEN I confirm deletion THEN THE System SHALL remove the link between the document and activity
6. WHEN deletion is complete THEN THE System SHALL return to the activity view and update the document count

---

### Requirement 9: Monitor Storage Usage

**User Story:** As a user, I want to see how much storage my documents are using, so I can manage my space.

#### Acceptance Criteria

1. WHEN I open settings THEN THE System SHALL display current storage usage in MB
2. WHEN I view storage usage THEN THE System SHALL display total available storage quota
3. WHEN I view storage usage THEN THE System SHALL display a breakdown by data type (documents, activities, profile)
4. WHEN storage usage exceeds 80% of quota THEN THE System SHALL display a warning banner in the app
5. WHEN I view storage details THEN THE System SHALL show the number of documents stored
6. WHEN I view storage details THEN THE System SHALL show the total size of all documents

---

### Requirement 10: Handle Camera Permission Errors

**User Story:** As a user, I want clear guidance when camera access is denied, so I know how to fix the issue.

#### Acceptance Criteria

1. WHEN camera permission is denied THEN THE System SHALL display an error message explaining why camera access is needed
2. WHEN camera permission is denied THEN THE System SHALL provide instructions to enable camera access in device settings
3. WHEN camera permission is denied THEN THE System SHALL offer the file upload option as an alternative
4. WHEN camera access fails for any reason THEN THE System SHALL log the error and display a user-friendly message
5. WHEN camera is not available on the device THEN THE System SHALL hide the camera button and only show upload option

---

## Out of Scope

The following features are NOT included in this specification:

- ❌ Document filtering or search functionality
- ❌ Document editing or annotation
- ❌ OCR (text extraction from images)
- ❌ PDF document support
- ❌ Document sharing or export (separate from activity export)
- ❌ Cloud backup or sync
- ❌ Document expiration or archiving
- ❌ Bulk document operations
- ❌ Document categories beyond the predefined types

---

## Success Criteria

This feature is successful when:

- ✅ Users can capture photos with their device camera
- ✅ Users can upload existing photos from their device
- ✅ Documents are compressed to save storage space
- ✅ Documents are linked to activities and visible in the activity list
- ✅ Users can view full-size documents with zoom
- ✅ Users can delete documents they no longer need
- ✅ Storage usage is monitored and users are warned before running out of space
- ✅ Camera permission errors are handled gracefully
- ✅ All functionality works offline

---

## Technical Constraints

- **File Types**: JPEG and PNG only (no HEIC, no PDF)
- **File Size Limit**: 10MB per document after compression
- **Storage**: IndexedDB for both metadata and blobs
- **Compression**: Canvas API for client-side image compression
- **Camera Access**: MediaDevices API (getUserMedia)
- **Mobile-First**: Optimized for mobile device cameras and touch interfaces

---

## Privacy & Security

- **Local Storage Only**: All documents stored in IndexedDB on the user's device
- **No Transmission**: Documents never sent to any server
- **User Control**: Users can delete documents at any time
- **Storage Transparency**: Users can see exactly how much storage is used
- **Permission Respect**: Camera access only requested when user initiates capture

---

## Dependencies

This feature depends on:

- Existing activity tracking functionality (to link documents to activities)
- IndexedDB schema (will need to add documents and documentBlobs tables)
- Existing settings page (to display storage usage)

---

## Notes

- Camera API support varies by browser; fallback to file upload is essential
- iOS Safari has limitations with camera access in PWAs
- Image compression quality of 0.8 provides good balance between size and readability
- Consider adding image rotation functionality in future iterations if users report issues with photo orientation
