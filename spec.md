# Recruitment Management Platform

## Overview
A recruitment management platform that connects organizations with candidates through a dual-interface system. Organizations can post job vacancies and review candidates, while candidates can browse jobs and manage their applications.

## User Types
- **Organizations**: Companies that post job vacancies and review candidates
- **Candidates**: Job seekers who apply to positions and manage their profiles

## Core Features

### Authentication & Registration
- Separate registration flows for organizations and candidates
- Login system with role-based redirection to appropriate dashboards
- User type identification for proper interface routing

### Homepage
- Landing page explaining the platform benefits with hero image
- Separate sections highlighting features "For Organizations" and "For Candidates" with relevant icons
- Call-to-action buttons for registration/login for each user type

### Organization Interface

#### Dashboard
- Overview of open vacancies with basic statistics
- Application statistics (total applications, pending reviews)
- Recent candidate matches and notifications
- Job matching visualization with analytics charts

#### Vacancy Management
- Create new job postings with title, description, requirements
- Set vacancy visibility (public/private)
- Specify allowed candidate criteria for private postings
- View list of current and past vacancies
- Track vacancy status (open/closed) and applicant counts
- Basic analytics per vacancy

#### Candidate Review
- List of candidates who applied to organization's vacancies
- Resume preview functionality
- Match scoring system between candidate and vacancy requirements
- Accept/reject candidate applications
- Provide feedback to candidates

#### Organization Profile
- Manage company information and contact details
- Upload and update organization logo with default fallback
- Edit organization description and details

### Candidate Interface

#### Dashboard
- Personalized job recommendations based on profile
- Track submitted applications and their current status
- Recent activity and notifications

#### Job Search & Applications
- Browse available public job listings
- Access private job listings (invitation-only)
- Apply to positions with resume submission
- View detailed job descriptions and requirements

#### Application Tracking
- Monitor application status for each submitted application
- View feedback from organizations (Under Review, Rejected, Forwarded)
- Track application timeline and updates

#### Resume Management
- Upload multiple resume versions with resume icon
- Update and edit stored resumes
- Preview resume as organizations would see it

#### Candidate Profile
- Manage personal information and contact details
- Add skills, experience, and qualifications
- Update availability and job preferences

## Visual Design Requirements
- Modern, responsive design using Tailwind CSS with light/dark mode support
- Color-coded themes to distinguish user types (blue accents for organizations, green accents for candidates)
- Sidebar navigation for dashboard interfaces
- Clean top navigation bar for main site navigation
- Consistent branding and layout across all interfaces
- Mobile-first responsive design for all screen sizes
- Integration of platform icons and imagery throughout the interface
- Analytics visualization components for job matching data

## Backend Data Storage
- User accounts (organizations and candidates) with authentication
- Job vacancy listings with requirements and visibility settings
- Candidate applications and their status
- Resume files and candidate profiles
- Organization profiles and company information
- Application tracking and feedback data
- Match scoring data between candidates and vacancies

## Backend Operations
- User registration and authentication for both user types
- CRUD operations for job vacancies
- Application submission and status management
- Resume file upload and storage
- Candidate-vacancy matching algorithm
- Application analytics and reporting
- Profile management for both user types
