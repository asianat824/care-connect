# Consolidate care profiles into My Care Circle

## What will change
- Keep the Family Caregiver view as the default and preserve the Paid Caregiver role switch unchanged.
- Rename the product everywhere to **Connected Care**, keeping “Connection is care.” as the tagline.
- Remove the separate **People I Care For** navigation item so the family flow is Home → My Check-In → My Care Circle → Care Network → Care Moments.
- Make **People I Care For** the first and default tab within My Care Circle, followed by **Care Team**, **Requests**, and **Care Updates**.
- Move the complete existing people list and full profile experience into My Care Circle without removing any data, actions, reminders, voice tools, priorities, handoffs, or printable summaries.
- Combine general updates, warm handoffs, and paid-caregiver handoffs in **Care Updates**, clearly labeled by type and source, with review behavior preserved.
- Redirect old `/people` links to the corresponding My Care Circle people view, including direct profile and detail links.

## Interaction details
- Ruth’s list action will read **View care profile and priorities**.
- Full profiles will return through **Back to My Care Circle**, reopening the People I Care For tab.
- Requests linked to Ruth will continue to show **For Mama Ruth** and keep the privacy-safe **Ask the Care Network** path.
- The four tabs will wrap cleanly and remain keyboard accessible on smaller screens.

## Technical approach
- Reuse the existing people/profile implementation inside the Care Circle route rather than duplicating it.
- Add typed Care Circle search parameters for tab, person, and detail state.
- Keep `/people` as a redirect-only compatibility route that forwards its search parameters.
- Update internal links and page metadata while preserving local saved data and all existing state behavior.

## Verification
- Check family and paid navigation, old-route redirects, profile return behavior, requests, updates, handoffs, role switching, and Connected Care titles.
- Test desktop and mobile layouts for overflow and keyboard-readable controls.
- Confirm the preview builds without errors.
