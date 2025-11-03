# Changelog

All notable changes to WorkPath will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-03

### Added - Document Management System 📸

A complete document capture and management system that allows users to photograph or upload verification documents and link them directly to their logged activities.

#### Camera & Upload Capabilities
- **Camera capture** - Take photos of documents directly from your phone using the device camera
- **File upload** - Upload existing photos from your device storage
- **Automatic image compression** - Images over 5MB are automatically compressed to save storage space
- **Smart validation** - File type and size validation with clear error messages
- **Dual capture methods** - Seamlessly switch between camera and file upload

#### Document Organization
- **Activity linking** - Documents are automatically linked to the activity you're logging
- **Document types** - Categorize documents as pay stubs, volunteer letters, school enrollment, or other
- **Custom descriptions** - Add optional notes to each document (up to 200 characters)
- **Document metadata** - Track capture method, file sizes, and timestamps

#### Viewing & Management
- **Document indicators** - See at a glance which activities have attached documents
- **Thumbnail gallery** - View all documents for an activity in a scrollable grid
- **Full-size viewer** - Open documents in a full-screen viewer with pinch-to-zoom support
- **Easy deletion** - Remove documents with confirmation dialog
- **Document counts** - Track how many documents are attached to each activity

#### Storage Management
- **Storage monitoring** - Real-time tracking of storage usage and available space
- **Low storage warnings** - Automatic alerts when storage reaches 80% capacity
- **Storage breakdown** - Detailed view of storage usage by document count and size
- **Quota checking** - Prevents saving documents when storage is full

#### Technical Improvements
- **IndexedDB schema v2** - New `documents` and `documentBlobs` tables for efficient storage
- **Blob separation** - Metadata and image data stored separately for optimal performance
- **Object URL management** - Proper cleanup to prevent memory leaks
- **Offline-first** - All document features work completely offline
- **Mobile-optimized** - Touch-friendly interfaces and responsive layouts

### Changed
- **ActivityForm** - Enhanced with document capture workflow and attached document display
- **ActivityList** - Now shows document indicators with counts for activities that have documents
- **Settings page** - Added storage management section with usage details
- **Database version** - Upgraded from v1 to v2 with new document tables

### Technical Details
- Added `react-zoom-pan-pinch` library for document viewer zoom functionality
- Added `zod` library for document metadata validation
- Implemented canvas-based image compression utility
- Created comprehensive document storage layer with error handling
- Added storage quota monitoring hooks and components

### Developer Experience
- New component library in `src/components/documents/`
- New storage utilities in `src/lib/storage/documents.ts`
- New TypeScript types in `src/types/documents.ts`
- Comprehensive error handling for camera permissions and storage issues

---

## [0.1.0] - 2025-10-XX

### Added - Initial MVP Release

#### Core Features
- **Activity tracking** - Log work, volunteer, and education hours daily
- **Visual calendar** - See all logged activities at a glance with date indicators
- **Monthly compliance** - Automatic calculation of 80-hour requirement
- **Progress dashboard** - Real-time compliance status and monthly totals
- **Activity management** - Edit and delete logged activities
- **Data export** - Export data as JSON or formatted text for agency submission

#### PWA Capabilities
- **Offline-first** - Complete functionality without internet connection
- **Installable** - Add to home screen on mobile devices
- **Service worker** - Automatic caching for offline use
- **App manifest** - Native app-like experience

#### Privacy & Security
- **Local storage only** - All data stays on your device using IndexedDB
- **No accounts** - No sign-up, no login, no authentication required
- **No tracking** - Zero analytics or data collection
- **GPL-3.0 license** - Open source and transparent

#### User Experience
- **Mobile-first design** - Optimized for phone screens and touch interfaces
- **Material-UI components** - Clean, accessible, and familiar interface
- **Simple onboarding** - Quick profile setup to get started
- **Settings management** - Configure profile and export data

#### Technical Foundation
- Next.js 14 with App Router
- TypeScript for type safety
- Dexie.js for IndexedDB management
- Material-UI v5 component library
- date-fns for date manipulation
- next-pwa for Progressive Web App features

---

## Release Notes

### v2.0.0 - Document Management

This is a major release that adds comprehensive document capture and management capabilities to WorkPath. Users can now photograph or upload verification documents (pay stubs, volunteer letters, school enrollment forms) and link them directly to their logged activities.

**Key highlights:**
- 📸 Camera capture with automatic compression
- 📁 File upload with drag-and-drop support
- 🔍 Full-size document viewer with zoom
- 💾 Smart storage management with quota monitoring
- 📱 Fully mobile-optimized and offline-capable

This release represents 10 completed tasks across 8 major implementation areas, including database schema updates, image processing utilities, camera/upload components, metadata forms, activity integration, document display, storage monitoring, and comprehensive error handling.

**Upgrade notes:**
- Database automatically upgrades from v1 to v2
- No data migration required
- Existing activities continue to work normally
- New document features available immediately

### v0.1.0 - Initial MVP

The first release of WorkPath, providing essential activity tracking and compliance monitoring for Medicaid work requirements. This MVP establishes the foundation with offline-first architecture, privacy-focused design, and mobile-optimized user experience.

---

[2.0.0]: https://github.com/naretakis/workpath/compare/v0.1.0...v2.0.0
[0.1.0]: https://github.com/naretakis/workpath/releases/tag/v0.1.0
