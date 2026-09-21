# Paid caregiver workspace refinement

## What will change
- Keep the Family Caregiver experience unchanged while reducing Alicia’s navigation to Home, My Check-In, Care Team, Care Connect, and Care Moments.
- Consolidate the existing People I Support and Handoff Notes experiences into a three-tab Care Team workspace.
- Add a separate, privacy-safe Care Connect page for workplace and broader paid-caregiver peer support.
- Keep legacy paid-caregiver URLs working by redirecting them to the matching Care Team tab.

## Care Team
- Add responsive tabs in this order: People I Support, Work Team, Handoff Notes, with People I Support selected by default.
- Preserve Mama Ruth’s approved care information, shift details, priority, family contact, permitted supporting-person details, care-update action, and end-of-shift handoff action.
- Add a focused approved-details view with the required family-contact section and permission notice.
- Add fictional Work Team profiles for Monique Harris, Tasha Reed, and David Chen.
- Add functional single-recipient and multi-recipient support-request forms, including “Select everyone”; requests remain separate from private check-ins and persist locally.
- Preserve the existing handoff form and history without duplicating records.

## Care Connect
- Add Workplace Community and Caregiver Community tabs with the requested descriptions, privacy notice, sample conversations, response counts, and working join/start conversation interactions.
- Save newly started fictional conversations locally.
- Never prefill or copy names or information from care recipients, handoffs, family contacts, support requests, or private check-ins.

## Privacy and role behavior
- Keep paid My Check-In private and separate from the employer, Work Team, family contacts, and Care Connect.
- Limit Alicia’s People I Support view to explicitly shared care details and approved contact context.
- Allow Care Moments contributions only where Alicia already has the relevant permission.
- Preserve the existing role switch, family navigation, styling, demo data, and handoff submission behavior.

## Technical details
- Extend local prototype state for Work Team requests and Care Connect conversations while safely defaulting older saved state.
- Use Care Team search state to open the correct tab from Home and legacy routes.
- Add unique page metadata for Care Connect and updated Care Team content.
- Verify desktop and mobile navigation, tabs, request forms, handoff submission, peer conversations, permission boundaries, persistence, and horizontal overflow.
