# Separate family Care Circle and Care Team

## What will change
- Update the family My Care Circle tabs to: People I Care For, Care Circle, Care Team, Requests, Care Updates.
- Place Marcus Ellis and Denise Park in Care Circle with their existing details, permissions, and request eligibility.
- Place Alicia Boateng in the new family-side Care Team with her existing professional-care details, permissions, and actions.
- Add the requested descriptions and distinct add buttons for unpaid supporters and care professionals.
- Require every new invitation to choose Care Circle or Care Team, then show the member in that selected tab.
- Group delegated-request recipients under Care Circle and Care Team without changing response tracking or private check-in protections.
- Leave the paid caregiver Care Team, Work Team, handoffs, shared profile, role switcher, and Care Connect unchanged.

## Technical details
- Add a persisted member category with compatibility classification for existing saved members.
- Extend family Care Circle search validation and rendering for the five-tab structure.
- Reuse the existing member cards, permissions, invitation fields, and request logic rather than duplicating behavior.
- Update family links that currently target the old mixed Care Team tab to target Care Circle.

## Verification
- Check family tabs, member placement, invitation category routing, and grouped request recipients on desktop and mobile.
- Confirm request response state and private check-in content remain unchanged.
- Confirm the paid caregiver workspace is unchanged and the preview builds cleanly.
