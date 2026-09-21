# Care Connect

Create a responsive web-app prototype for a caregiving support platform. Use “[PROJECT NAME]” as a temporary name that can easily be replaced later.

This first version is designed from the perspective of an unpaid caregiver who provides care for a family member, friend, child, older adult, or person with a disability.

PRODUCT PURPOSE

Help unpaid caregivers:

Check in with their own health, needs, and capacity.

Remember important details about the people they care for.

Coordinate support with a trusted care circle.

Make better-informed care decisions.

Preserve the human relationship beyond appointments and responsibilities.

This should feel like a warm, supportive community-care platform. It should not resemble a hospital portal, case-management database, or medical-record system.

CORE MESSAGE

“Connection is care.”

The product should help preserve both the caregiver and the relationship between the caregiver and the person receiving care.

USER SCOPE

Build the primary experience for:

Unpaid family and friend caregivers.

Allow the caregiver to invite the person receiving care into a limited, optional “My Voice” experience. This gives the individual a way to contribute preferences, needs, and memories without creating a completely separate product.

Do not build a dedicated paid-caregiver dashboard yet. Members of the Care Circle may be labeled as paid caregivers, but paid-caregiver workflows will come later.

NAVIGATION

Create five main navigation items:

Home

My Check-In

People I Care For

My Care Circle

Care Moments

Use bottom navigation on mobile and a simple left-side navigation on desktop.

ONBOARDING

Create a short onboarding flow.

Screen 1: Welcome

Headline: “Care for them without losing yourself.”

Supporting text: “A space to understand your needs, remember what matters, and coordinate care with people you trust.”

Primary button: “Set Up My Care Space”

Screen 2: Caregiver information

Ask:

First name

Who do you help care for?

What is your relationship to them?

Do you care for more than one person?

Allow users to add another person later.

Screen 3: Care priorities

Ask the caregiver what they want help with:

Keeping important information together

Understanding my own needs

Sharing responsibilities

Communicating with other caregivers

Staying connected to the person I care for

Allow multiple selections.

HOME DASHBOARD

Create a welcoming dashboard with a calm greeting such as:

“Good morning, Jordan. How are you holding up today?”

Show:

A quick capacity check-in

People I Care For

Current requests for help

Recent Care Circle activity

A Care Moment prompt

One clear button to complete a full check-in

Do not make the dashboard crowded. Prioritize emotional clarity and the most important next action.

MY CHECK-IN

Purpose: Preserve the caregiver by giving them a private place to decompress, recognize their needs, and decide when to ask for help.

Include:

Current mood

Current energy level

Current capacity

“What have you done for yourself today?”

“What do you need today?”

“What feels outside of your capacity?”

An open notes area

For capacity, use clear options such as:

I have capacity

I am feeling stretched

I am overwhelmed

I need support now

After identifying something outside their capacity, allow the caregiver to:

Keep it private

Turn it into a request for help

Send the request to selected Care Circle members

Example request:

“I need someone to pick up groceries by Thursday.”

Let the caregiver select:

Type of support

Preferred date

Care Circle members who can see the request

Any instructions

Make check-ins private by default. Clearly explain what will be shared before anything is sent to the Care Circle.

Include a simple check-in history showing patterns in mood, energy, and capacity. Avoid diagnostic or clinical language.

PEOPLE I CARE FOR

Purpose: Remember the whole person and the important details that make care more personal and consistent.

Allow caregivers to create profiles for one or more people.

Each profile should include:

Name

Photo or initials

Relationship

Preferred name

Pronouns, optional

What matters to them

Daily routines

Likes and dislikes

Communication style

Comfort preferences

Important updates

Current care-coordination notes

Organize the profile into these sections:

About Them

Routine

Preferences

Communication

Important Updates

Care Coordination

Care Moments

Include examples such as:

“Prefers to receive one instruction at a time.”

“Likes gospel music in the morning.”

“Becomes anxious when plans change without warning.”

“Prefers appointments after 11:00 a.m.”

Place personhood and preferences before medical or task-related information.

Add a “Create Warm Handoff” button. This should generate a concise handoff summary containing what the next caregiver needs to know.

Do not create a medical-record system. Do not request Social Security numbers, insurance documents, diagnoses, or other sensitive health records.

MY CARE CIRCLE

Purpose: Create a trusted network for sharing responsibilities, communicating changes, and completing warm handoffs.

Allow the caregiver to invite:

Family members

Friends

Neighbors

Paid caregivers

Other trusted supporters

Each member should have:

Name

Relationship or role

Contact information

Availability

What they can help with

Permission level

Permission options should include:

View basic care information

View important updates

Receive requests for help

Add care updates

Contribute to Care Moments

Do not give every member access to everything automatically.

Create these Care Circle sections:

Members

Requests for Help

Offers to Help

Care Updates

Warm Handoffs

Local Resources

Community Support

A request should allow Care Circle members to accept it and mark it complete.

A warm handoff should show:

What happened recently

What needs attention

The person’s current preferences

The next planned action

Who is responsible

For Community Support, create a simple prototype area showing supportive discussion topics and lived-experience conversations. Keep this limited to sample content for now. Do not build a full public social network or messaging system yet.

CARE MOMENTS

Purpose: Humanize caregiving and preserve the relationship through shared memories, interests, and meaningful connection.

Treat this as a digital memory box.

Allow users to create:

Shared playlists or song links

Favorite memories

Photos

Video links

Stories

Conversation prompts

Activities the person enjoys

Include a daily or weekly connection prompt, such as:

“What song reminds you of a happy memory together?”

“What is something they taught you?”

“What always makes them laugh?”

“What activity helps both of you feel present?”

Allow Care Circle members and the person receiving care to contribute when given permission.

Use “Connection is care” as the Care Moments supporting message.

OPTIONAL “MY VOICE” EXPERIENCE

Do not create a full third user dashboard.

Inside each person’s profile, add an option:

“Invite them to contribute”

When enabled, show a simplified and accessible My Voice screen where the person receiving care can:

Add or update their preferences

Describe how they want people to communicate with them

Say how they are feeling today

Say what they want help with

Say what they would like to do for enjoyment

Add a memory, song, photo, or story

Review information that will be shared with the Care Circle

Use large text, simple buttons, plain language, and minimal navigation.

The caregiver should not be able to impersonate the person receiving care. Clearly label which contributions came directly from the individual.

DESIGN DIRECTION

Use a warm, dignified, nonclinical design.

Temporary visual direction:

Soft cream background

Deep plum or muted navy for primary text

Sage green for supportive actions

Warm coral for connection-related highlights

Rounded but professional cards

Large, readable typography

Clear spacing

Accessible color contrast

Calm, human-centered icons

Avoid:

Hospital imagery

Medical crosses

Cold blue clinical dashboards

Excessive charts

Childlike illustrations

Dense task-management screens

Use real, human language throughout the interface.

PROTOTYPE REQUIREMENTS

For this first version:

Use fictional sample data.

Make every primary navigation item functional.

Make buttons and forms interactive.

Save prototype changes in local state or local storage.

Include useful empty states.

Include mobile and desktop layouts.

Include a Reset Demo button.

Use local placeholders for photo and media uploads.

Do not connect to real medical systems.

Do not store sensitive personal or health information.

Do not add payments, facility administration, professional case-management tools, or a paid-caregiver dashboard.

Create a complete demonstration flow:

Unpaid caregiver completes onboarding.

Caregiver completes a personal check-in.

Caregiver identifies something outside their capacity.

Caregiver turns it into a request.

A Care Circle member accepts the request.

Caregiver views or creates a warm handoff.

Caregiver adds a Care Moment.

User previews the optional My Voice experience.

Build this as the first functional prototype. Keep the structure flexible so paid-caregiver features, stronger community tools, authentication, and a database can be added later.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1c799eb2-cc8c-4e48-bf1e-b1ef3f06b921).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
