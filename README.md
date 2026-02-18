<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1gUHXhqtnbMfB1ajSU8sBLXlfsVAbUEM6

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Resume Analyzer API (Backend)

This project now includes a production-style Express backend for AI-powered resume analysis.

### 1) Configure environment

Copy `.env.example` to `.env` and set:

- `GEMINI_API_KEY`
- `PORT` (optional, default `8080`)
- `MAX_FILE_SIZE_MB` (optional)
- `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` (optional placeholder limiter)
- `COVER_LETTER_RATE_LIMIT_WINDOW_MS` and `COVER_LETTER_RATE_LIMIT_MAX_REQUESTS` (optional AI generation limiter)

### 2) Start backend

Install dependencies, then run:

- `npm run dev:server` (watch mode)
- `npm run start:server` (normal mode)

### 3) API endpoint

- `POST /api/analyze-resume`
- `Content-Type: multipart/form-data`
- Fields:
  - `resume`: PDF file
  - `jobDescription`: text

### 4) Example response shape

```json
{
  "success": true,
  "data": {
    "match_score": 82,
    "strengths": [],
    "missing_skills": [],
    "keyword_gaps": [],
    "ats_issues": [],
    "improved_bullets": [],
    "summary": ""
  },
  "meta": {
    "resume_characters": 3450,
    "job_description_characters": 2100
  }
}
```

## AI Cover Letter Generator API

### Endpoint

- `POST /api/ai/generate-cover-letter`
- Content-Type: `multipart/form-data`

### Request fields

- `applicationId`: string (required)
- `tone`: one of `Professional | Confident | Friendly | Concise | Executive`
- `application`: JSON string with application payload (required in current local-storage integration)
  - Must include: `id`, `company`, `role`, `description`
- `resume`: file (optional if `resumeText` provided) - supports PDF/DOCX
- `resumeText`: text (optional if `resume` provided)

### Response shape

```json
{
  "success": true,
  "data": {
    "coverLetter": "string",
    "matchedSkills": ["string"],
    "suggestedImprovements": ["string"]
  },
  "meta": {
    "applicationId": "string",
    "tone": "Professional",
    "allowedTones": ["Professional", "Confident", "Friendly", "Concise", "Executive"]
  }
}
```
