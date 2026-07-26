# TerpTracker

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?logo=clerk&logoColor=white&style=for-the-badge)

## About

**TerpTracker** is a smart schedule analyzer for University of Maryland students that uses real PlanetTerp data to predict your schedule's difficulty before you commit to it. Built with **Next.js** and **TypeScript**, it analyzes course combinations to generate survivability scores, realistic GPA predictions, and smart warnings about dangerous workloads.

## Features

- Survivability Score — 1–10 rating of how brutal a given schedule will be
- GPA prediction with a realistic range based on historical course difficulty data
- Smart warnings that detect dangerous course combinations and heavy workloads
- Live course data pulled from the PlanetTerp API
- Schedule save, load, and export functionality with local storage
- Authentication via Clerk for personalized schedule management
- Classmate finder to see who else is enrolled in your courses

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Auth**: Clerk
- **Data**: PlanetTerp API

## Deployment

Visit the live site at [https://terp-tracker.vercel.app](https://terp-tracker.vercel.app)
