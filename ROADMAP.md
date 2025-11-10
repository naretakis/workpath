# HourKeep Roadmap

**Keep Your Hours, Keep Your Coverage**

This roadmap outlines where HourKeep is today, what we're building next, and our vision for the future.

---

## Now - ✅ Shipped

**Current Release - Available Today**

HourKeep provides a privacy-first onboarding experience, helps you determine if you're exempt from Medicaid work requirements, and if not, track work, volunteer, and education hours with comprehensive document management and contextual help throughout the app.

### Core Features

- ✅ **Activity Tracking** - Log daily work, volunteer, and education hours
- ✅ **Visual Calendar** - See all your logged activities at a glance
- ✅ **Monthly Compliance** - Automatic calculation of your 80-hour requirement
- ✅ **Progress Dashboard** - Know exactly where you stand each month
- ✅ **Edit & Delete** - Fix mistakes in your entries
- ✅ **Data Export** - Generate JSON or text reports for agency submission
- ✅ **Offline First** - Works completely without internet
- ✅ **PWA Support** - Install as a native app on your phone
- ✅ **Privacy First** - All data stays on your device, nothing sent to servers

### Document Management 📸

- ✅ **Camera Capture** - Take photos of documents directly from your phone
- ✅ **File Upload** - Upload existing photos from your device
- ✅ **Smart Compression** - Automatic image compression for large files
- ✅ **Document Organization** - Link documents to activities with types and descriptions
- ✅ **Thumbnail Gallery** - View all documents for an activity
- ✅ **Full-Size Viewer** - Open documents with pinch-to-zoom support
- ✅ **Storage Monitoring** - Track usage and get low-storage warnings
- ✅ **Document Management** - Easy deletion with confirmation

### Enhanced Onboarding 🔐

- ✅ **Privacy Notice First** - Clear explanation of data handling before any data collection
- ✅ **Extended Profile** - Name, state, date of birth, Medicaid ID, contact info
- ✅ **Secure Encryption** - Date of birth and Medicaid ID encrypted at rest
- ✅ **Profile Management** - View and edit your information in settings
- ✅ **Age-Based Exemption** - Date of birth enables automatic age exemption screening
- ✅ **Mobile-Optimized Forms** - Touch-friendly inputs with smart validation
- ✅ **Privacy Policy Access** - Review privacy policy anytime from settings

### Exemption Screening 🎯

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

### Activity Definitions Help 💡

- ✅ **Contextual Help** - Get guidance right where you need it
- ✅ **Activity Definitions** - Clear explanations for work, volunteer, education, work programs
- ✅ **Edge Case Examples** - 20+ scenarios showing what counts and what doesn't
- ✅ **Income Guidance** - Understand the $580/month threshold and seasonal worker rules
- ✅ **Combination Rules** - Learn how to mix activities to reach 80 hours
- ✅ **Dashboard Onboarding** - First-time user guidance with 4 key steps
- ✅ **Mobile-Responsive** - Tooltips on desktop, bottom sheets on mobile
- ✅ **Plain Language** - 8th grade reading level, no jargon
- ✅ **HR1 Sourced** - All definitions cite Section 71119 for accuracy

**Key Clarifications:**

- Job searching does NOT count as a qualifying activity
- Activities can be combined to reach 80 hours
- Income ($580/month) is an alternative to hours
- Seasonal workers can average income over 6 months

---

## Next - 🚧 Coming Soon

**Planned Features**

These are the next features we're building, in roughly this order:

### Income Tracking 💰

Track income alongside hours to meet the $580/month alternative requirement.

**What You'll Be Able To Do:**

- Log income with pay period (hourly, daily, weekly, monthly)
- Automatic conversion to monthly equivalent
- Support for seasonal workers (6-month averaging)
- Income compliance status on dashboard
- Combined hours + income view

**Why This Matters:**

- Some people meet requirements through income, not hours
- Provides flexibility for different work situations
- Aligns with HR1 legislation requirements

---

### Hardship Reporting 🆘

Report temporary hardships that affect your ability to meet requirements.

**What You'll Be Able To Do:**

- Report medical hardships (hospitalization, serious illness)
- Track disaster hardships (automatic based on county)
- Track unemployment hardships (automatic based on county rate)
- Link hardship periods to compliance calculations
- Attach supporting documents
- View hardship history

**Why This Matters:**

- Life happens - system should accommodate temporary setbacks
- Required by HR1 legislation
- Reduces stress during difficult times

---

### Exemption Document Capture 📸

Attach supporting documents to your exemption screening responses.

**What You'll Be Able To Do:**

- Upload documents for each exemption category
- Capture photos of medical records, school enrollment, etc.
- Link documents to specific exemption responses
- View all exemption documents in one place
- Include exemption documents in exports

**Why This Matters:**

- Agencies may request proof of exemption status
- Having documents ready speeds up verification
- Reduces stress when asked for documentation
- Natural extension of existing document management

---

### Comprehensive Export Overhaul 📦

Export everything - profile, activities, documents, exemptions, income, hardships.

**What You'll Be Able To Do:**

- Export complete compliance package
- Include profile information (name, contact info, Medicaid ID)
- Include all activities with attached documents
- Include exemption screening results and documents
- Include income records and hardship reports
- Multiple export formats (JSON, PDF, text)
- Professional formatting for agency submission
- Export warning about personal information

**Why This Matters:**

- One-click submission of everything agencies need
- Agencies need your contact information for processing
- Reduces back-and-forth with caseworkers
- Complete compliance documentation in one package
- Saves time during verification requests

---

## Later - 💭 Future Considerations

**Ideas We're Exploring**

These features align with the full Medicaid work requirements domain but aren't yet scheduled. We'll prioritize based on user feedback and real-world needs.

### SNAP Work Requirements Support

Expand to support SNAP (food assistance) work requirements in addition to Medicaid. This would be a major undertaking requiring significant research and design work.

### State System Integration 🔗

API integration with state Medicaid systems for direct data submission. Would require partnerships with state agencies and careful privacy/security considerations.

### Compliance Alerts & Predictions 📊

Proactive notifications to help you stay on track with risk alerts, projected compliance based on historical patterns, deadline countdowns, and recommendations for meeting requirements.

### Multi-Language Support 🌍

- Spanish translation
- Language selector in settings
- Translated help content

### State-Specific Configurations 🗺️

- State-specific exemption variations
- Custom hour requirements
- State agency contact information
- State-specific reporting deadlines

### Advanced Analytics 📈

- Compliance trends over time
- Activity type breakdown
- Average hours per week/month
- Compliance streak tracking

---

## Not Planned ❌

**Things We've Decided Against**

To keep HourKeep simple, privacy-focused, and offline-first, we're explicitly NOT building:

- ❌ **Cloud sync or backup** - Conflicts with privacy-first approach
- ❌ **User accounts or authentication** - Adds complexity, reduces privacy
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

## Release Strategy

**How We Ship:**

- Ship features independently as they're completed
- Each feature is fully functional on its own
- No waiting for entire version to be complete
- Continuous improvement based on usage
- User feedback shapes what we build next

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
