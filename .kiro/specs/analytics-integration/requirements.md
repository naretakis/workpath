# Requirements Document

## Introduction

HourKeep currently operates with zero analytics or usage tracking. To better understand which states need this tool most and to improve the user experience, we need to add privacy-first analytics. This feature will integrate Plausible Analytics (a lightweight, GDPR-compliant analytics service) and update our privacy notice to accurately reflect what anonymous usage data is collected.

The implementation must maintain HourKeep's privacy-first values: no personal data collection, no tracking of user activities or hours, and full transparency about what is collected.

## Glossary

- **HourKeep**: The PWA application for tracking Medicaid work requirement hours
- **Plausible Analytics**: A privacy-first, lightweight, open-source web analytics service
- **Privacy Notice**: The onboarding screen that explains data handling to users
- **Anonymous Usage Data**: Non-personal data about app usage (page views, device types, regions/states, etc.)
- **Personal Data**: User profile information, activity logs, documents, or any identifying information
- **Static Site**: A website hosted as HTML/CSS/JS files without server-side processing (GitHub Pages)

## Requirements

### Requirement 1: Privacy-First Analytics Integration

**User Story:** As a developer, I want to understand basic usage patterns including state-level data without compromising user privacy, so that I can improve the app and understand which states need this tool most.

#### Acceptance Criteria

1. WHEN the HourKeep application loads, THE System SHALL load the Plausible Analytics script from Plausible's CDN
2. THE System SHALL configure Plausible Analytics to respect "Do Not Track" browser settings
3. THE System SHALL NOT send any personal data (profile information, activity logs, documents, or exemption data) to Plausible Analytics
4. THE System SHALL NOT use cookies for analytics tracking purposes
5. WHERE a user has "Do Not Track" enabled in their browser, THE System SHALL NOT load the Plausible Analytics script

### Requirement 2: Transparent Privacy Notice Update

**User Story:** As a user, I want to know exactly what anonymous data is collected, so that I can make an informed decision about using the app.

#### Acceptance Criteria

1. THE System SHALL update the Privacy Notice to accurately describe anonymous usage data collection
2. THE Privacy Notice SHALL explain what specific data is collected (page views, device type, browser, states)
3. THE Privacy Notice SHALL explain what data is NOT collected (no personal information, no activity tracking, no hour logs)
4. THE Privacy Notice SHALL explain that analytics respect "Do Not Track" browser settings
5. THE Privacy Notice SHALL maintain plain language and avoid technical jargon
6. THE Privacy Notice SHALL clearly distinguish between local data storage (personal) and anonymous usage analytics (non-personal)

### Requirement 3: Minimal Implementation

**User Story:** As a developer, I want the analytics integration to be simple and maintainable, so that it doesn't add complexity to the codebase.

#### Acceptance Criteria

1. THE System SHALL implement Plausible Analytics using only the standard script tag integration method
2. THE System SHALL NOT require any custom JavaScript code beyond the standard Plausible script
3. THE System SHALL NOT require any server-side components or API endpoints
4. THE System SHALL NOT modify existing application functionality or user flows
5. THE System SHALL add the analytics script to the root layout component only

### Requirement 4: State-Level Geographic Data

**User Story:** As a developer, I want to see which U.S. states are using HourKeep most, so that I can understand where Medicaid work requirements are having the most impact.

#### Acceptance Criteria

1. THE System SHALL collect region/state-level geographic data through Plausible Analytics
2. THE System SHALL display state-level usage data in the Plausible Analytics dashboard
3. THE System SHALL document the analytics implementation approach in code comments
4. THE Privacy Notice SHALL explain that state-level (not city-level) geographic data is collected
5. THE System SHALL NOT collect or display city-level or more granular geographic data

### Requirement 5: Documentation and Transparency

**User Story:** As a user or contributor, I want to understand what analytics are in place, so that I can verify the privacy claims.

#### Acceptance Criteria

1. THE System SHALL document the Plausible Analytics integration in the README
2. THE System SHALL explain what data Plausible Analytics collects in the README
3. THE System SHALL provide a link to Plausible's privacy policy in the documentation
4. THE System SHALL update the CHANGELOG to reflect the analytics addition
5. THE System SHALL maintain consistency between the Privacy Notice, README, and actual implementation
