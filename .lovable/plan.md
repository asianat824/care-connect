# Add Their Voice and Care Network

## What will change
- Replace each profile’s voice action with “Add [name]’s voice” and open an accessible choice dialog for private request, completing together, recording a conversation, or adding an observation.
- Add a no-account guest contribution page that exposes only six optional questions, invitation privacy information, submit confirmation, and decline controls.
- Track invitation status locally, including send method, fictional recipient, waiting state, resend, cancel, copied-link access, and submitted/declined outcomes.
- Make profile sources precise: direct guest submissions, completed-together responses, caregiver-recorded conversations, caregiver observations, Care Circle contributions, and unconfirmed details receive distinct labels.
- Add Care Network between My Care Circle and Care Moments in desktop and mobile navigation, with privacy-separated Peer Support, Caregiver Resources, and Local Support sections.
- Move existing community and local-resource content out of My Care Circle so it remains focused on members, requests, updates, handoffs, and permissions.

## Care Network experience
- Peer Support includes fictional topic cards, browsable sample conversations, and a locally saved “Ask the Care Network” form with a privacy reminder.
- Caregiver Resources includes searchable fictional demonstration cards with save and detail interactions.
- Local Support accepts a ZIP code and filters fictional programs by Online, In person, Free, Evening, and Weekend.
- A prominent privacy notice makes clear that check-ins, personal notes, profiles, requests, and Care Circle information are never shared automatically.

## Technical details
- Extend the existing local saved-state model rather than adding accounts, a database, or another active user type.
- Add dedicated Care Network and guest-response routes with route-specific metadata; the guest route renders outside the caregiver shell to prevent private-space exposure.
- Preserve current status, check-back, archive, and update behavior while migrating existing fictional source values safely.
- Keep dialogs, tabs, forms, and navigation keyboard accessible; use wrapped desktop controls and compact six-item mobile navigation without horizontal overflow.
- Verify the full invitation-to-response flow, source labels, Care Network interactions, desktop/mobile layouts, privacy boundaries, and preview build.
