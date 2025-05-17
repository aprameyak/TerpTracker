🧠 TerpTrack

Your Smart UMD Schedule Analyzer
📌 Overview

TerpTrack is a web application designed to help University of Maryland students evaluate their semester schedules using real data from PlanetTerp and natural language processing (NLP). By integrating course data, professor reviews, and grade distributions, the app delivers actionable insights into workload, difficulty, and compatibility — all through a clean and interactive interface.
🎯 Purpose

Students often struggle to assess how their planned classes will balance out — especially when dealing with unknown professors or course combinations. TerpTrack automates this evaluation by analyzing:

    Average GPAs for courses and professors

    Sentiment and keyword extraction from student reviews

    Potential risk factors from schedule overlap

    Custom tags and warnings for high-stress course loads

🧱 Core Features
Feature	Description
Schedule Input	Users input their planned courses (course code, section, or professor)
Data Integration	Fetches data from the Planetterp API
GPA and Grade Analytics	Displays average GPAs, grade distributions, and pass/fail rates
Review Sentiment Analysis	Applies NLP to summarize student opinions about professors and courses
Risk Flags	Identifies heavy workloads, tough combinations, or poorly reviewed classes
Visual Report	Returns a dynamic report card with insights, tags, and a “survivability” score
🔌 Technical Stack
🔹 Backend

    Framework: FastAPI (or Flask)

    Data Sources: PlanetTerp API, optional web scraping for extra context

    NLP Tools: TextBlob, VADER, spaCy, or transformers for sentiment and keyword extraction

    Caching (Optional): Redis or lightweight DB to store recent evaluations

🔹 Frontend

    Framework: React.js or Next.js

    Styling: Tailwind CSS or Chakra UI

    Data Visualization: Chart.js, Recharts, or D3 for GPA trends and sentiment graphs

🧠 NLP Capabilities

TerpTrack extracts meaning from unstructured reviews to produce:

    Sentiment scores (positive/neutral/negative)

    Topic tags like “tough grader”, “responsive”, “exam-heavy”

    Difficulty indicators by aggregating student feedback and grade trends

🚀 Development Timeline
Milestone	Description	Duration
Phase 1: MVP	Course input, GPA lookup, PlanetTerp API integration	1–2 weeks
Phase 2	Sentiment analysis engine, difficulty tags, risk scoring	1 week
Phase 3	Full frontend integration, schedule summary UI, mobile support	1–2 weeks
Phase 4	Optional: User accounts, saving schedules, crowd-sourced tags	Stretch goal
💡 Unique Value

    Locally impactful: Tailored for UMD students with relevant campus-specific data

    Technically rich: Combines APIs, web scraping, and NLP

    Shareable & fun: Engaging UI with visual reports and light gamification

⚙️ Deployment & Testing

    Frontend: Vercel or Netlify

    Backend: Render, Railway, or Fly.io

    Testing: PyTest for backend logic, Jest for React components

    Monitoring: Use basic logging + error tracking (e.g., Sentry) for early feedback

🔮 Future Enhancements

    UMD login integration (SSO or Clerk)

    Course combination recommender system

    Peer reviews and crowd-verified difficulty scores

    Browser extension or Testudo integration

✅ Summary

TerpTrack is a focused, technically impressive, and highly usable application that solves a real student pain point. By combining structured academic data with natural language review analysis, the app empowers students to plan smarter and avoid schedule overload — all in a clean, friendly interface.
