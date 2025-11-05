# HourKeep Roadmap

**Keep Your Hours, Keep Your Coverage**

This roadmap outlines where HourKeep is today, what we're building next, and our vision for the future.

---

## Now (v4.0) - ✅ Shipped

**Current Release - Available Today**

HourKeep provides a privacy-first onboarding experience, helps you determine if you're exempt from Medicaid work requirements, and if not, track work, volunteer, and education hours with comprehensive document management.

### Core Features (v1.0)

- ✅ **Activity Tracking** - Log daily work, volunteer, and education hours
- ✅ **Visual Calendar** - See all your logged activities at a glance
- ✅ **Monthly Compliance** - Automatic calculation of your 80-hour requirement
- ✅ **Progress Dashboard** - Know exactly where you stand each month
- ✅ **Edit & Delete** - Fix mistakes in your entries
- ✅ **Data Export** - Generate JSON or text reports for agency submission
- ✅ **Offline First** - Works completely without internet
- ✅ **PWA Support** - Install as a native app on your phone
- ✅ **Privacy First** - All data stays on your device, nothing sent to servers

### Document Management (v2.0) 📸

- ✅ **Camera Capture** - Take photos of documents directly from your phone
- ✅ **File Upload** - Upload existing photos from your device
- ✅ **Smart Compression** - Automatic image compression for large files
- ✅ **Document Organization** - Link documents to activities with types and descriptions
- ✅ **Thumbnail Gallery** - View all documents for an activity
- ✅ **Full-Size Viewer** - Open documents with pinch-to-zoom support
- ✅ **Storage Monitoring** - Track usage and get low-storage warnings
- ✅ **Document Management** - Easy deletion with confirmation

### Enhanced Onboarding (v4.0) - NEW! 🔐

- ✅ **Privacy Notice First** - Clear explanation of data handling before any data collection
- ✅ **Extended Profile** - Name, state, date of birth, Medicaid ID, contact info
- ✅ **Secure Encryption** - Date of birth and Medicaid ID encrypted at rest
- ✅ **Profile Management** - View and edit your information in settings
- ✅ **Age-Based Exemption** - Date of birth enables automatic age exemption screening
- ✅ **Mobile-Optimized Forms** - Touch-friendly inputs with smart validation
- ✅ **Privacy Policy Access** - Review privacy policy anytime from settings

### Exemption Screening (v3.0) 🎯

- ✅ **Complete Questionnaire** - Simple questions covering all 5 exemption categories
- ✅ **Smart Question Flow** - Dynamic questions that adapt to your answers
- ✅ **Immediate Results** - Know right away if you're exempt or need to track
- ✅ **Plain Language** - No legal jargon, clear explanations
- ✅ **Definition Tooltips** - Tap any term to see what it means
- ✅ **Dashboard Integration** - Prominent exemption status display
- ✅ **Screening History** - Track your status over time
- ✅ **Rescreen Workflow** - Update status when circumstances change

**Exemption Categories:**

- Age-based (18 or younger, 65 or older)
- Family/caregiving (pregnant, young children, disabled dependent)
- Health/disability (Medicare, medically frail, disabled veteran)
- Program participation (SNAP/TANF, rehabilitation)
- Other (incarcerated, tribal status)

### What's Still Missing

- ❌ Profile information in exports
- ❌ Income tracking
- ❌ Hardship reporting
- ❌ Compliance alerts

---

## Next (v4.1) - 🚧 Coming Soon

**Export Improvements**

### Profile Information in Exports 📄

**Status:** Ready to build  
**Estimated:** 1-2 weeks

Include profile information in data exports for professional agency submission.

**What You'll Be Able To Do:**

- Export data with your name and contact information
- Include Medicaid ID in exports
- Professional formatting with profile section at top
- Export warning about personal information

**Why This Matters:**

- Agencies need your contact information
- More professional and complete submissions
- Reduces manual data entry for caseworkers

---

## Later (v5.0+) - 💭 Future Considerations

**Ideas We're Exploring**

These features align with the full Medicaid work requirements domain but aren't yet scheduled. We'll prioritize based on user feedback and real-world needs.

### Income Tracking 💰

Track income alongside hours to meet the $580/month alternative requirement.

**Potential Features:**

- Log income with pay period (hourly, daily, weekly, monthly)
- Automatic conversion to monthly equivalent
- Support for seasonal workers (6-month averaging)
- Income compliance status on dashboard
- Combined hours + income view

**Why Consider This:**

- Some people meet requirements through income, not hours
- Provides flexibility for different work situations
- Aligns with HR1 legislation requirements

---

### Hardship Reporting 🆘

Report temporary hardships that affect your ability to meet requirements.

**Potential Features:**

- Report medical hardships (hospitalization, serious illness)
- Track disaster hardships (automatic based on county)
- Track unemployment hardships (automatic based on county rate)
- Link hardship periods to compliance calculations
- Attach supporting documents
- View hardship history

**Why Consider This:**

- Life happens - system should accommodate temporary setbacks
- Required by HR1 legislation
- Reduces stress during difficult times

---

### Compliance Alerts & Predictions 📊

Proactive notifications to help you stay on track.

**Potential Features:**

- Risk alerts (< 60 hours with < 1 week remaining)
- Projected compliance based on historical patterns
- Deadline countdown (days remaining in month)
- Missing documentation alerts
- Recommendations for meeting requirements

**Why Consider This:**

- Prevents last-minute scrambling
- Helps users plan ahead
- Reduces non-compliance risk

---

### Verification Response Generator 📄

Respond quickly to agency verification requests.

**Potential Features:**

- Log verification requests from agency
- Track due dates (30-day response period)
- Generate formatted responses with relevant data
- Include activities, documents, and compliance summary
- Printable/exportable format

**Why Consider This:**

- HR1 requires 30-day response to verification requests
- Having data organized makes response easier
- Reduces stress when agency asks for proof

---

### Help System & Guided Tours 💡

Better onboarding and support for new users.

**Potential Features:**

- Searchable help center
- FAQ section
- Contextual help tooltips
- Guided tours for first-time users
- Video tutorials or animated guides
- Agency contact information

**Why Consider This:**

- Reduces confusion for new users
- Decreases support burden
- Improves user confidence

---

### Multi-Language Support 🌍

Reach more users by supporting multiple languages.

**Potential Features:**

- Spanish translation (most requested)
- Language selector in settings
- Translated help content
- Professional translation (not machine-generated)

**Why Consider This:**

- Many Medicaid beneficiaries speak Spanish
- Increases accessibility
- Aligns with equity goals

---

### State-Specific Configurations 🗺️

Adapt to different state implementations of work requirements.

**Potential Features:**

- State-specific exemption variations
- Custom hour requirements (if different from 80)
- State agency contact information
- State-specific reporting deadlines
- Custom compliance lookback periods

**Why Consider This:**

- States may implement requirements differently
- Provides accurate information for each state
- Reduces confusion about local rules

---

### Advanced Analytics 📈

Deeper insights into your compliance patterns.

**Potential Features:**

- Compliance trends over time
- Activity type breakdown (work vs volunteer vs education)
- Average hours per week/month
- Compliance streak tracking
- Exportable charts and graphs

**Why Consider This:**

- Helps users understand their patterns
- Identifies areas for improvement
- Provides motivation through progress tracking

---

### PWA Library Upgrade 🔧

Update to a more actively maintained PWA solution.

**Context:**

The current `next-pwa@5.6.0` library uses deprecated Workbox packages and hasn't been updated recently. While everything works fine now, upgrading would improve long-term maintainability.

**Potential Approaches:**

- Upgrade to `@ducanh2912/next-pwa` (actively maintained fork)
- Check for newer `next-pwa` versions
- Roll custom service worker implementation

**Why Consider This:**

- Reduces deprecation warnings in builds
- Ensures compatibility with future Next.js versions
- Improves long-term maintainability
- No immediate urgency (no security issues, everything works)

**Timeline:**

- Low priority maintenance task
- Address during a maintenance sprint
- Or when deprecations cause actual build issues

---

### SNAP Work Requirements Support 🍎

Expand HourKeep to support SNAP (food assistance) work requirements in addition to Medicaid.

**Context:**
SNAP has its own work requirements for "Able-Bodied Adults Without Dependents" (ABAWDs). While similar to Medicaid requirements, there are important differences:

- 80 hours/month requirement (same as Medicaid)
- 3-month time limit in a 36-month period if not meeting requirements
- Different exemption categories
- "Good cause" provisions for temporary hardships
- Employment & Training (E&T) program participation

**Potential Features:**

- SNAP-specific exemption screening (ABAWD criteria)
- Time limit tracking (3 months used out of 36)
- Good cause reporting for missed hours
- E&T activity tracking
- Combined Medicaid + SNAP compliance view
- SNAP-specific export formats

**Why Consider This:**

- Many people receive both Medicaid and SNAP
- Similar tracking needs (80 hours/month)
- Reduces burden of using multiple apps
- Addresses a real need in the benefits ecosystem

**Challenges:**

- SNAP rules are more complex (time limits, good cause, E&T)
- State-by-state variation in implementation
- Different exemption categories than Medicaid
- Would significantly increase app complexity
- Requires careful design to avoid confusion between programs

**Approach:**
If we build this, it would likely be:

- A separate mode or profile setting ("Track for Medicaid", "Track for SNAP", "Track for Both")
- Clear visual distinction between program requirements
- Shared activity tracking (same hours count for both)
- Program-specific exemption screening and compliance calculations
- Careful user research to ensure clarity

**Timeline:**
This is a major undertaking that would require:

- Deep research into SNAP implementation across states
- User research with people receiving both benefits
- Significant design work to avoid confusion
- Extensive testing with real users
- Likely 3-6 months of development

**User Feedback Needed:**

- Would you use HourKeep for SNAP tracking?
- Do you receive both Medicaid and SNAP?
- What's most confusing about SNAP work requirements?
- Would combined tracking be helpful or confusing?

---

## Not Planned ❌

**Things We've Decided Against**

To keep HourKeep simple, privacy-focused, and offline-first, we're explicitly NOT building:

- ❌ **Cloud sync or backup** - Conflicts with privacy-first approach
- ❌ **User accounts or authentication** - Adds complexity, reduces privacy
- ❌ **Integration with state systems** - Beyond scope, requires partnerships
- ❌ **Automatic verification** - Can't access state databases
- ❌ **Social features or sharing** - Privacy risk
- ❌ **Payment or monetization** - This is a public good
- ❌ **Native mobile apps** - PWA provides same functionality
- ❌ **Desktop-only features** - Mobile-first is our priority

---

## How We Prioritize

**Our Decision Framework:**

1. **User Impact** - Does it solve a real problem for Medicaid beneficiaries?
2. **Legislative Alignment** - Does it support HR1 requirements?
3. **Privacy & Security** - Can we build it without compromising privacy?
4. **Offline-First** - Does it work without internet?
5. **Mobile-First** - Does it work well on phones?
6. **Simplicity** - Does it keep the app easy to use?
7. **Feasibility** - Can we build and maintain it?

**User Feedback Matters:**

- We prioritize features based on real user needs
- If you're using HourKeep, your feedback shapes the roadmap
- Open an issue on GitHub to suggest features or report problems

---

## Timeline & Releases

**Current Plan:**

- **v1.0** (Shipped Oct 2025) - Basic activity tracking MVP
- **v2.0** (Shipped Nov 2025) - Document management
- **v3.0** (Shipped Nov 2025) - Exemption screening
- **v4.0** (Shipped Nov 2025) - Enhanced onboarding
- **v4.1** (Q4 2025) - Export improvements
- **v5.0** (TBD) - Features from "Later" section based on user feedback

**Release Strategy:**

- Ship features independently as they're completed
- Each feature is fully functional on its own
- No waiting for entire version to be complete
- Continuous improvement based on usage

---

## Get Involved

**This is an open project.** We welcome:

- 💬 **Feedback** - Tell us what's working and what's not
- 🐛 **Bug Reports** - Help us fix issues
- 💡 **Feature Requests** - Suggest what you need
- 🤝 **Contributions** - Code, design, documentation, testing

**How to Contribute:**

- Open an issue on GitHub
- Review the specs in `.kiro/specs/`
- Check the domain knowledge in `.kiro/steering/medicaid-domain-knowledge.md`
- Follow the development standards in `.kiro/steering/`

---

## Questions?

**Want to know more about a specific feature?**

- Check the detailed specs in `.kiro/specs/[feature-name]/`
- Each spec includes requirements, design, and implementation tasks

**Want to understand the domain better?**

- Read `.kiro/steering/medicaid-domain-knowledge.md`
- Review the HR1 legislation context
- Understand the exemption categories and compliance requirements

**Want to see the current state?**

- Check the main [README.md](README.md) for what's available now
- Try the app and see what works today

---

**Last Updated:** November 2025
**Current Version:** v4.0 (Enhanced Onboarding)  
**Next Release:** v4.1 (Export Improvements)
