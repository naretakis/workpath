# Image Compression Testing Guide

## Manual Testing

> **The `/test-compression` page is gone.** W0 § 0.6 deleted the route: it was publicly reachable at
> `hourkeep.app/test-compression` and precached by the service worker, so every user was shipping a
> developer harness. Test through the real capture flow instead — see "Testing steps" below.
>
> Compression against real photographs is still a **manual** check, and deliberately so (ADR-0007
> Tier 4): it needs the Canvas API, which jsdom does not implement. What *is* automated:
>
> - `src/lib/utils/__tests__/imageCompression.test.ts` — the validation logic.
> - `src/lib/utils/__tests__/compressForStorage.test.ts` — the compress-if-over-5MB decision and the
>   refuse-if-still-over-10MB check, using an injected compressor so the size logic is testable without
>   a real canvas. That second check is the one W0 rescued out of a dead component before deleting it.

### Test Cases

#### 1. Small Images (< 1MB)

- **Expected**: May increase slightly in size if already optimized, or compress minimally
- **Verify**: Compression completes successfully, quality is acceptable

#### 2. Medium Images (1-5MB)

- **Expected**: Should compress to 20-50% of original size
- **Verify**: Significant size reduction, quality remains good for document verification

#### 3. Large Images (5-10MB)

- **Expected**: Should compress significantly, typically to < 2MB
- **Verify**: Major size reduction, image still readable

#### 4. Very Large Images (> 10MB after compression)

- **Expected**: Should be rejected with error message
- **Verify**: Error message displayed, file not saved

#### 5. Invalid File Types

- **Expected**: Validation error for non-JPEG/PNG files
- **Verify**: Clear error message about supported formats

### Testing Steps

1. Start the development server: `npm run dev`
2. Go to `/tracking`, open an activity, and use **Add document** — or `/income` and an income entry.
   Both routes reach `DocumentCapture`, which is where uploads and camera captures now converge.
3. Test each scenario above by selecting appropriate image files
4. Verify compression results match expected behavior
5. Check that quality is acceptable for document verification purposes
6. Confirm an image still over 10MB after compression is **refused with a message naming the size and
   what to try**, rather than failing later as a storage-quota error

### Validation Tests

The validation functions are tested in `__tests__/imageCompression.test.ts`:

- File type validation (JPEG/PNG only)
- File size validation
- File size formatting

### Compression Parameters

- **Max dimension**: 1920px (maintains aspect ratio)
- **Quality**: 0.8 (JPEG compression quality)
- **Max size threshold**: 5MB (triggers compression)
- **Max final size**: 10MB (rejects if exceeded)

### Success Criteria

✅ Compression reduces file size for images > 5MB
✅ Quality remains acceptable for document verification
✅ Progress callback reports accurate progress
✅ Validation catches invalid file types
✅ Validation catches oversized files
✅ Error messages are clear and helpful
