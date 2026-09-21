# Paid Ruth profile Care Circle

## Changes
- Add a Care Circle tab to Ruth’s profile for Alicia, between What Matters to Ruth and Shared Care Conversation.
- Move Jordan’s approved contact details and actions, plus Marcus and Denise’s approved support details, from above the profile tabs into that new tab.
- Keep the paid Care Team page and its People I Support, Work Team, and Handoff Notes tabs unchanged.
- Keep the family version of Ruth’s shared profile unchanged.

## Verification
- Confirm the paid profile tab order, member details, approved actions, and permissions.
- Confirm Send Care Update and Complete Handoff still work.
- Check the profile at desktop and mobile sizes, plus the family-profile tab regression and preview diagnostics.

## Technical details
- Make the shared profile’s available tabs role-aware so Care Circle appears only for the paid-caregiver view.
- Reuse the existing member data and permission-gated actions rather than duplicating profile data.
