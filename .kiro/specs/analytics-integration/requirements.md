# Requirements Document

## Introduction

HourKeep currently operates with zero analytics or usage tracking. To better understand which states need this tool most and to improve the user experience, we need to add privacy-first analytics. This feature will integrate Cloudflare Web Analytics (a cookieless, GDPR-compliant analytics service) and update our privacy notice to accurately reflect what anonymous usage data is collected.

The implementation must maintain HourKeep's privacy-first values: no personal data collection, no tracking of user activities or hours, and full transparency about what is collected.

## Glossary

- **HourKeep**: The PWA application for tracking Medicaid work requirement hours
- **Cloudflare Web Analytics**: A privacy-first, cookieless web analytics service
- **Privacy Notice**: The onboarding screen that explains data handling to users
- **Anonymous Usage Data**: Non-personal data about app usage (page views, device types, etc.)
- **Personal Data**: User profile information, activity logs, documents, or any identifying information
- **Static Site**: A website hosted as HTML/CSS/JS files without server-side processing (GitHub Pages)

## Requirements

### Requirement 1: Privacy-First Analytics Integration

**User Story:** As a developer, I want to understand basic usage patterns without compromising user privacy, so that I can improve the app and understand which states need this tool most.

#### Acceptance Criteria

1. WHEN the HourKeep application loads, THE System SHALL load the Cloudflare Web Analytics script from Cloudflare's CDN
2. THE System SHALL configure Cloudflare Web Analytics to respect "Do Not Track" browser settings
3. THE System SHALL NOT send any personal data (profile information, activity logs, documents, or exemption data) to Cloudflare Web Analytics
4. THE System SHALL NOT use cookies or local storage for analytics tracking purposes
5. WHERE a user has "Do Not Track" enabled in their browser, THE System SHALL NOT load the Cloudflare Web Analytics script

### Requirement 2: Transparent Privacy Notice Update

**User Story:** As a user, I want to know exactly what anonymous data is collected, so that I can make an informed decision about using the app.

#### Acceptance Criteria

1. THE System SHALL update the Privacy Notice to accurately describe anonymous usage data collection
2. THE Privacy Notice SHALL explain what specific data is collected (page views, device type, browser, country)
3. THE Privacy Notice SHALL explain what data is NOT collected (no personal information, no activity tracking, no hour logs)
4. THE Privacy Notice SHALL explain that analytics respect "Do Not Track" browser settings
5. THE Privacy Notice SHALL maintain plain language and avoid technical jargon
6. THE Privacy Notice SHALL clearly distinguish between local data storage (personal) and anonymous usage analytics (non-personal)

### Requirement 3: Minimal Implementation

**User Story:** As a developer, I want the analytics integration to be simple and maintainable, so that it doesn't add complexity to the codebase.

#### Acceptance Criteria

1. THE System SHALL implement Cloudflare Web Analytics using only the standard script tag integration method
2. THE System SHALL NOT require any custom JavaScript code beyond the standard Cloudflare script
3. THE System SHALL NOT require any server-side components or API endpoints
4. THE System SHALL NOT modify existing application functionality or user flows
5. THE System SHALL add the analytics script to the root layout component only

### Requirement 4: Future Extensibility

**User Story:** As a developer, I want the ability to add state-level tracking later, so that I can scale analytics capabilities if needed without breaking existing implementation.

#### Acceptance Criteria

1. THE System SHALL implement analytics in a way that allows future addition of Cloudflare Workers for custom tracking
2. THE System SHALL document the analytics implementation approach in code comments
3. THE Privacy Notice SHALL be structured to allow easy addition of future analytics capabilities
4. THE System SHALL NOT create dependencies that would prevent adding custom analytics endpoints later

### Requirement 5: Documentation and Transparency

**User Story:** As a user or contributor, I want to understand what analytics are in place, so that I can verify the privacy claims.

#### Acceptance Criteria

1. THE System SHALL document the Cloudflare Web Analytics integration in the README
2. THE System SHALL explain what data Cloudflare Web Analytics collects in the README
3. THE System SHALL provide a link to Cloudflare's privacy policy in the documentation
4. THE System SHALL update the CHANGELOG to reflect the analytics addition
5. THE System SHALL maintain consistency between the Privacy Notice, README, and actual implementation
