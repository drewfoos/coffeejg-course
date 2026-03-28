1. Project idea

We are building a course website for VTubing, focused mainly on 3D VTubing and Warudo (will also have resources for 2D and pngtubing).
The site should have:

paid courses with video lessons
a free resource hub for assets
shared account login across both parts of the site

The course experience should feel similar to a structured learning platform like NeetCode, but for VTubing education instead of coding.

2. Main goal

The goal is to ship to real users and have people:

sign up
log in
pay for courses
access private lessons
browse and save resources in the asset hub

This means the project should be built like a real product, not just a prototype.

3. Main milestones
Milestone 1

Build the foundation:

shared auth/login system
Stripe payments
protected paid course access
idempotent purchase/enrollment handling
Milestone 2

Build the free resource hub:

searchable asset library (pagination)
filterable asset cards
favorites/heart system
shared account support

Milestone 3

Build the first course:

course structure
lesson pages
video player
progress tracking
free and paid lessons
use placeholder YouTube videos during development if needed
Product 1: Course Platform Core Features
Core features
user sign up and login
same account works across courses and resource hub
paid course access after purchase
Stripe checkout
course pages with lesson sidebar
lesson pages with video player
support for free and paid lessons
mark lesson complete
track lesson progress
optional lesson ratings
optional comments/questions later
Course UX goals
clear course navigation
structured modules and lessons
easy progress tracking
similar feel to a modern video course platform

Product 2: Resource Hub Core Features
Core features
same sign-in/account as the course platform
navbar
search
filtering
pagination
asset card layout
preview image
title
artist name
short description on the card
tags
source/origin tag
heart/favorite system
click to open a larger modal/detail view
external link to visit the original asset page
Asset card should show
image
title
artist name
short description
tags
source label
heart button
link to original asset
Expanded modal/detail view should show
larger image
full title
artist name
full description
tags
source
heart button
external asset link
Important engineering requirement
Idempotency is very important

Any action tied to money, access, or saved user state must be safe to retry.

This especially applies to:

Stripe webhook handling
purchase fulfillment
course enrollment
marking lessons complete
favoriting assets
ratings

Duplicate requests or retries should not create duplicate records or inconsistent state.

MVP scope

For version 1, focus on:

Course side
auth
Stripe
1 course
lesson sidebar
lesson page
video player
progress tracking
free vs paid lesson gating
Resource hub side
searchable asset list
card layout
image/title/artist/description
tags and source
favorites
filters
pagination
modal/detail view
external link
Video hosting note

Private/self-hosted video is annoying, so using something like Vimeo for hosted private/domain-restricted embeds is probably the right direction, while the app itself controls user access.

Simple summary

This project is a VTubing education platform with two connected products:

A paid video course platform
A free searchable VTubing asset/resource hub

Both should share the same account system, and the foundation needs to support real users, payments, gated content, and reliable/idempotent backend behavior.