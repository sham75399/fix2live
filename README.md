# Fix2Live – AI-Powered Project Error Analysis & One-Click Deployment

A hackathon prototype for automatically analyzing project errors and simulating one-click deployment.

## Features

- **Project Upload**: Drag-and-drop ZIP file upload
- **Analysis Dashboard**: Rules-based project analysis showing:
  - Overall Readiness Score (0–100)
  - Critical errors, warnings, and passed checks
  - Detailed error information with suggested solutions
- **Testing**: Simulated test suite execution
- **Deployment Readiness**: Checks for code, build, runtime, security, and configuration
- **One-Click Deploy**: Simulated deployment with demo URL generation
- **Demo Project**: Pre-loaded demo project for testing

## Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **File Upload**: Multer
- **Storage**: In-memory (MVP)

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd fix2live