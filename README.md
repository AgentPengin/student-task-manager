[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/YHSq4TPZ)
# To-Do App – Preliminary Assignment Submission
⚠️ Please complete **all sections marked with the ✍️ icon** — these are required for your submission.

👀 Please Check ASSIGNMENT.md file in this repository for assignment requirements.

## 🚀 Project Setup & Usage
**How to install and run your project:**  
✍️  
Example (replace with your actual steps)  
- `npm install`  
- `npm run dev`

## 🔗 Deployed Web URL or APK file
✍️ [[TimeStream - Student Time Manager](https://student-task-manager-beta.vercel.app/)]


## 🎥 Demo Video
**Demo video link (≤ 2 minutes):**  
📌 **Video Upload Guideline:** when uploading your demo video to YouTube, please set the visibility to **Unlisted**.  
- “Unlisted” videos can only be viewed by users who have the link.  
- The video will not appear in search results or on your channel.  
- Share the link in your README so mentors can access it.  

✍️ [[Demo link](https://www.youtube.com/watch?v=DCtUEokXXXw)]


## 💻 Project Introduction

### a. Overview

Student Task Manager (TimeStream) is a lightweight web application built to help students stay on top of assignments, deadlines, and study sessions.  

Its core feature is the **Quick-add prompt**, which turns natural language input into structured tasks (e.g., `Math HW due tomorrow 17:00 ~90m #math p2`).  

The app includes a **Calendar view** for visualizing tasks over time, a **Focus mode** to minimize distractions during study, and is designed to be extendable with **AI-powered suggestions** for task prioritization and study planning.  

With a clean, responsive interface optimized for both desktop and mobile, the app leverages **React, TypeScript, Vite, and Tailwind**, and is deployed on **Vercel**.


### b. Key Features & Function Manual

### Key Features

- **Quick-add Prompt**: Create tasks instantly from natural language (e.g., `Math HW due tomorrow 17:00 ~90m #math p2`).
- **Calendar View**: Visualize tasks and deadlines in a clean, interactive calendar.
- **Focus Mode**: Enter a distraction-free environment to work on one task at a time.
- **Priority & Tags**: Assign priorities (`p1`, `p2`, `p3`, or `!!!`) and categorize tasks with hashtags.
- **Responsive UI**: Optimized for both desktop and mobile devices.
- **AI Suggestions (experimental)**: Receive smart recommendations on task prioritization and study planning.
- **Progress Tracking**: View completion stats and monitor study time for better productivity insights.

---

### Function Manual

#### 1. Adding Tasks
- Use the Quick-add input bar.
- **Syntax**:
  - **Title**: Task name (any text).
  - **Due date/time**: `due tomorrow 17:00`, `due 2025-09-20 23:59`, or `+2d 15:00`.
  - **Duration**: `~90m` or `~2h`.
  - **Tags**: `#math`, `#cs`, etc.
  - **Priority**: `p1`, `p2`, `p3`, or `!!!` (urgent).


#### 2. Managing Tasks
- Edit or delete tasks directly from the task list.
- Completed tasks will be archived for progress tracking.

#### 3. Calendar View
- Switch to the calendar tab to see tasks distributed by day/week.
- Click on a date to view or add tasks.

#### 4. Focus Mode
- Select any task → click **Focus**.
- The screen enters distraction-free mode, with a timer based on estimated duration.

#### 5. AI Suggestions (if enabled)
- Use the **Suggest** button to receive task ordering and study recommendations.



### c. Unique Features (What’s special about this app?) 
- **Natural-language Quick-add**: Instead of filling out multiple form fields, tasks can be created in one line of text (`Math HW due tomorrow 17:00 ~90m #math p2`), making task entry faster and more intuitive.  

- **Priority with flexible syntax**: Supports both structured (`p1`, `p2`, `p3`) and quick urgent input (`!!!`), so students can mark importance in the way that feels natural.  

- **Student-focused design**: Tags and prompts are tailored for academic use cases (assignments, labs, exams, study sessions), not generic business tasks.  

- **Focus Mode for studying**: More than just checking off tasks, Focus Mode creates a distraction-free environment with a timer based on estimated duration, helping students manage concentration time.  

- **Calendar + Task synergy**: Tasks integrate directly into a calendar view, allowing both list-based productivity and schedule visualization.  

- **AI-ready architecture**: Designed to be extendable with AI-driven features, such as suggesting which task to prioritize next, estimating study time, or generating a balanced daily plan.  

- **Lightweight but professional**: Built with React, TypeScript, Vite, and Tailwind, deployed via Vercel—optimized for speed and accessibility while still flexible for feature growth.


### d. Technology Stack and Implementation Methods

- **Frontend Framework**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/) for type safety and maintainable component-based architecture.  
- **Build Tool**: [Vite](https://vitejs.dev/) for fast development server and optimized production builds.  
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling, responsive layouts, and consistent design system.  
- **Deployment**: [Vercel](https://vercel.com/) for seamless CI/CD, automatic HTTPS, and global edge hosting.  
- **State Management**: React hooks (and context where needed) for lightweight, predictable task state management.  
- **Data Handling**: Local storage in the current version; planned integration with cloud database for persistence across devices.  
- **Task Parser**: Custom text parser using regex and date/time libraries to interpret natural-language inputs (`due tomorrow 17:00`, `~90m`, `#tag`, `p1`, `!!!`).  
- **Extendability**: Architecture designed for future integration of AI-based services (e.g., task prioritization, study suggestions).  


### e. Service Architecture & Database structure (when used)

✍️ [Write your content here]

## 🧠 Reflection

### a. If you had more time, what would you expand?

- **Cloud Sync & User Accounts**: Enable multi-device synchronization with authentication and secure cloud storage.  
- **AI-Powered Suggestions**: Smarter task prioritization, time estimation, and personalized study recommendations.  
- **Collaboration Features**: Shared task lists or study groups for team projects.  
- **Offline-first / PWA**: Full offline support with background sync for students with unstable internet.  
- **Advanced Analytics**: Visual reports on study patterns, productivity trends, and subject-specific workload.  



### b. If you integrate AI APIs more for your app, what would you do?

- **Smart Task Prioritization**: Analyze deadlines, workload, and estimated durations to suggest which tasks should be tackled first.  
- **Study Plan Generation**: Automatically create a personalized daily/weekly schedule based on assignments, exams, and available time slots.  
- **Natural Language Enhancements**: Improve the Quick-add parser to understand more flexible, conversational input (e.g., “Finish math homework by next Friday evening, should take 2 hours”).  
- **Context-aware Suggestions**: Recommend splitting large tasks into subtasks, allocating focus sessions, or detecting overloaded schedules.  
- **Productivity Insights**: AI-driven analysis of study patterns to highlight bottlenecks, predict delays, and suggest corrective actions.  
- **Learning Companion**: Act as a study partner by providing reports, feedback, and practical tips to continuously improve learning habits and productivity.  



## ✅ Checklist
- [x] Code runs without errors  
- [x] All required features implemented (add/edit/delete/complete tasks)  
- [x] All ✍️ sections are filled  
