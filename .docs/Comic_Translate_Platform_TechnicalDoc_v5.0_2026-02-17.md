**COMIC TRANSLATE PLATFORM**

Technical Documentation & Architecture Blueprint

Version 5.0 | February 17, 2026

_Prepared by: Nexus - Systems Analyst & Project Manager_

# Table of Contents

1. Introduction 3

1.1 Purpose and Scope 3

1.2 Target Audience 3

2. Reference Sample Applications 4

2.1 manga-image-translator 4

2.2 Dango-Translator 5

2.3 Key Takeaways 6

3. Product Requirements 7

3.1 Executive Summary 7

3.2 Business Goals 8

3.3 User Personas 9

3.4 User Stories 10

4. System Architecture 12

4.1 Technology Stack 12

4.2 High-Level Architecture 16

4.3 Database Schema 17

4.4 Security & Compliance 18

5. API Specifications 19

5.1 REST API Endpoints 19

5.2 Third-Party Integrations 21

6. Technical Risks 22

7. Development Setup 23

8. References 24

_Note: To update page numbers, right-click the Table of Contents and select "Update Field."_

# 1. Introduction

## 1.1 Purpose and Scope

The global manga and comic industry has experienced exponential growth over the past decade, with digital platforms enabling worldwide distribution. However, language barriers remain a significant obstacle for non-Japanese speakers seeking to access this content. Professional manga translation is a labor-intensive process requiring expertise in multiple applications: optical character recognition (OCR) tools for text extraction, spreadsheet software for translation management, and image editing software like Photoshop or Canva for typesetting. This fragmented workflow creates inefficiencies that can take 2-4 hours per chapter for experienced translators.

This technical documentation presents the architecture and implementation blueprint for the Comic Translate Platform, a unified web-based manga translation solution. The platform consolidates OCR, translation management, and visual editing into a single application, targeting both casual readers seeking instant translation and professional translators requiring advanced tooling. The document serves as a comprehensive guide for development teams, providing actionable specifications, architectural decisions, and implementation patterns.

To inform the architecture and feature set, this document analyzes two established open-source reference applications: manga-image-translator and Dango-Translator. These projects provide valuable insights into OCR pipelines, translation workflows, and user interface patterns that have been validated by the manga translation community.

## 1.2 Target Audience

This document is intended for the following audiences:

- Software Engineers: Developers responsible for implementing frontend, backend, and AI integration components.
- Technical Architects: Stakeholders evaluating technology choices and system design decisions.
- Project Managers: Team leads planning development sprints and resource allocation.
- Quality Assurance: QA engineers developing test plans based on acceptance criteria.
- UI/UX Designers: Designers creating user interfaces informed by reference application analysis.

# 2. Reference Sample Applications

The following open-source applications serve as reference implementations for manga translation workflows. They provide proven solutions, architectural patterns, and feature implementations that can inspire and guide the development of the Comic Translate Platform. Developers are encouraged to study these codebases for implementation details and best practices.

## 2.1 manga-image-translator

Repository:

> https://github.com/zyddnys/manga-image-translator

### 2.1.1 Overview

manga-image-translator is an open-source project designed to translate text within manga and comic images. The project originated from the need to make manga content accessible to readers who lack Japanese proficiency. It combines OCR, machine translation, and image inpainting into a unified pipeline that processes images end-to-end. The project was previously deployed at cotrans.touhou.ai, demonstrating production-ready capabilities.

### 2.1.2 Core Features

| **Feature**      | **Description**                              | **Technical Implementation**                         |
| ---------------- | -------------------------------------------- | ---------------------------------------------------- |
| OCR Engine       | Detects and extracts text from manga images  | manga-ocr, Tesseract, PaddleOCR, Google Cloud Vision |
| Translation      | Translates extracted text to target language | Google Translate, DeepL, GPT-4, NLLB                 |
| Inpainting       | Removes original text and fills background   | LaMa, Stable Diffusion, OpenCV                       |
| Text Rendering   | Renders translated text onto image           | PIL/Pillow with custom font handling                 |
| Batch Processing | Processes multiple images in sequence        | Command-line interface with file I/O                 |
| Web Interface    | Optional web UI for image upload             | Gradio-based web application                         |

_Table 1: manga-image-translator Core Features_

### 2.1.3 Technical Architecture

The application follows a pipeline architecture where each processing stage operates sequentially on the input image. The modular design allows users to select different OCR engines, translation providers, and inpainting methods based on their requirements and available resources.

Architecture Components:

1. Input Layer: Accepts image files (PNG, JPG) via command line or web interface. Supports batch processing through directory scanning.
2. OCR Module: Multiple OCR engine options with automatic text detection. manga-ocr is optimized for manga-specific fonts and layouts.
3. Translation Module: Integrates multiple translation APIs. Supports offline models (NLLB) for users without API access.
4. Inpainting Module: Removes detected text regions using AI-based inpainting (LaMa) or traditional methods (OpenCV).
5. Rendering Module: Places translated text on cleaned images with configurable font, size, and positioning.
6. Output Layer: Exports processed images with optional side-by-side comparison views.

### 2.1.4 Applicable Patterns for Comic Translate Platform

The manga-image-translator project provides several patterns directly applicable to the Comic Translate Platform:

- Modular OCR Selection: Allow users to choose OCR engines based on accuracy/performance trade-offs.
- Multi-Provider Translation: Support multiple translation APIs with fallback mechanisms.
- Inpainting Options: Provide both AI-based (LaMa) and browser-based (OpenCV.js) text removal.
- Pipeline Abstraction: Design processing stages as independent, composable modules.
- Configuration Flexibility: Enable users to configure processing parameters per project.

## 2.2 Dango-Translator

Repository:

> https://github.com/PantsuDango/Dango-Translator

### 2.2.1 Overview

Dango-Translator is a desktop application designed for translating raw manga (often called "生肉" or raw meat in Chinese manga community). The project aims to provide the best possible manga translation software with a focus on user experience and translation quality. Unlike manga-image-translator, Dango-Translator emphasizes interactive editing and human-in-the-loop translation workflows.

### 2.2.2 Core Features

| **Feature**        | **Description**                      | **Technical Implementation**              |
| ------------------ | ------------------------------------ | ----------------------------------------- |
| OCR Integration    | Text detection and extraction        | Tesseract OCR with manga-ocr support      |
| Interactive Editor | Manual text box adjustment           | Qt-based GUI with drag-and-drop           |
| Translation APIs   | Multiple translation service support | Baidu, Google, DeepL, GPT APIs            |
| Project Management | Organize translation projects        | Local file-based project storage          |
| Glossary Support   | Custom terminology management        | User-defined dictionary system            |
| Export Options     | Multiple output formats              | Image export, text export, project backup |

_Table 2: Dango-Translator Core Features_

### 2.2.3 User Interface Design

Dango-Translator implements a desktop-oriented user interface with the following key design elements:

- Split-Pane Layout: Image preview on one side, translation panel on the other.
- Real-Time Preview: Immediate visual feedback when editing translations.
- Batch Operations: Select multiple text boxes for simultaneous editing.
- Keyboard Shortcuts: Efficiency-focused interactions for power users.
- Progress Indicators: Visual feedback for long-running operations.

### 2.2.4 Applicable Patterns for Comic Translate Platform

Dango-Translator provides UI/UX patterns relevant to the Comic Translate Platform:

- Interactive Editing: Allow manual adjustment of detected text regions.
- Split-Pane Interface: Separate image preview from translation grid.
- Glossary Integration: Project-specific terminology management.
- Progress Visualization: Clear indicators for OCR and translation progress.
- Export Flexibility: Multiple output formats for different use cases.

## 2.3 Key Takeaways from Reference Applications

Analysis of both reference applications reveals common patterns and features essential for a manga translation platform. The following table summarizes key takeaways for implementation:

| **Aspect**   | **manga-image-translator**   | **Dango-Translator**     | **Comic Translate Platform Approach**               |
| ------------ | ---------------------------- | ------------------------ | --------------------------------------------------- |
| Deployment   | Web/CLI, Docker support      | Desktop application      | Web-based (SvelteKit) with optional desktop wrapper |
| OCR Engine   | Multiple options, modular    | Tesseract-based          | User-selectable: PaddleOCR, manga-ocr, Tesseract    |
| Translation  | API-based, offline models    | Multiple API support     | OpenRouter + BYOK + self-hosted options             |
| Inpainting   | LaMa, Stable Diffusion       | Limited/basic            | User-selectable: LaMa, OpenCV.js, SD                |
| UI Paradigm  | Pipeline-focused, minimal UI | Interactive editor       | Hybrid: pipeline + interactive grid editor          |
| Editing      | Limited manual override      | Full interactive editing | Grid-based editing + canvas manipulation            |
| Project Mgmt | File-based batch             | Project files            | Database-backed with chapter hierarchy              |

_Table 3: Comparative Analysis of Reference Applications_

The Comic Translate Platform combines the best aspects of both reference applications: the automated pipeline efficiency of manga-image-translator with the interactive editing capabilities of Dango-Translator. By leveraging modern web technologies (SvelteKit, Drizzle ORM), the platform achieves these capabilities while maintaining accessibility through a browser-based interface.

# 3. Product Requirements

## 3.1 Executive Summary

The Comic Translate Platform addresses a critical gap in the digital comics ecosystem: the absence of an integrated toolchain for manga localization. Current workflows force translators to navigate between 3-5 separate applications, each with its own learning curve and data format. This fragmentation not only reduces productivity but also introduces quality risks as context is lost during data transfer between tools.

The platform introduces three core innovations. First, an AI-powered OCR pipeline optimized for manga text detection, handling unique challenges such as vertical text, stylized fonts, and text overlaid on complex artwork. Second, a context-aware translation engine that analyzes character visuals to determine appropriate speech patterns, particularly crucial for Thai language honorifics that vary based on speaker gender, age, and social status. Third, an integrated visual editor combining spreadsheet-style translation management with canvas-based typesetting, eliminating application switching.

Drawing from the analysis of manga-image-translator and Dango-Translator, the platform implements a hybrid approach that combines automated pipeline processing with interactive editing capabilities. This architecture serves both casual readers seeking instant translation and professional translators requiring advanced tooling.

## 3.2 Business Goals & Success Metrics

| **Objective**            | **Target Metric**                    | **Measurement Method**        |
| ------------------------ | ------------------------------------ | ----------------------------- |
| Unified Workflow         | Reduce application switching by 100% | Before/after workflow audit   |
| Translation Productivity | 40-60% time reduction per chapter    | Time tracking per project     |
| OCR Accuracy             | >95% character recognition rate      | Manual correction frequency   |
| Translation Quality      | >85% user satisfaction score         | Post-project surveys          |
| System Reliability       | 99.5% uptime SLA                     | Infrastructure monitoring     |
| Performance              | Lighthouse score >90                 | Automated performance testing |

_Table 4: Business Objectives and Success Metrics_

## 3.3 User Personas

### 3.3.1 Persona: Casual Manga Reader

| **Attribute**    | **Description**                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Profile          | Nattaya, 24-year-old Thai university student                                                                            |
| Background       | Enjoys Japanese manga with limited Japanese proficiency (JLPT N4-N5). Currently relies on Google Translate screenshots. |
| Pain Points      | Poor translation quality, incorrect honorifics, inability to understand character relationships.                        |
| Goals            | Read manga with natural Thai translation, quickly fix minor errors, access variety of titles.                           |
| Tech Proficiency | High - comfortable with web applications and mobile apps.                                                               |

_Table 5: Casual Reader Persona Profile_

### 3.3.2 Persona: Professional Translator

| **Attribute**    | **Description**                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Profile          | Tanaka, 32-year-old freelance manga translator                                                   |
| Background       | 5 years experience translating Japanese manga to Thai. Processes 50-100 pages weekly.            |
| Pain Points      | Fragmented workflow (Excel + Photoshop + Canva), manual text extraction, no translation memory.  |
| Goals            | Reduce translation time by 50%, maintain consistent terminology, export publication-ready files. |
| Tech Proficiency | Expert - proficient in Photoshop, Excel, translation tools.                                      |

_Table 6: Professional Translator Persona Profile_

## 3.4 User Stories

Requirements are organized into six epics informed by reference application analysis:

### Epic 1: Project & Page Management

- As a translator, I want to create projects with title and metadata so that work is organized.
- As a translator, I want to upload multiple pages at once (ZIP support) so that setup is rapid.
- As a translator, I want to create chapters within projects so that pages follow manga structure.
- As a translator, I want to reorder pages via drag-and-drop so that order errors are corrected.

### Epic 2: OCR & Text Detection (inspired by manga-image-translator)

- As a translator, I want automatic text region detection so that manual identification is eliminated.
- As a translator, I want to select OCR engine (manga-ocr, PaddleOCR, Tesseract) so that I can optimize for my content.
- As a translator, I want to manually adjust OCR text boxes so that detection errors are corrected.
- As a translator, I want batch OCR processing so that entire chapters process automatically.

### Epic 3: Context-Aware Translation

- As a reader, I want automatic text translation so that content is immediately understandable.
- As a translator, I want character attribute detection so that honorifics are appropriate.
- As a translator, I want to configure translation provider (OpenRouter, Ollama, BYOK) so that I control cost/quality.
- As a translator, I want a project glossary so that terminology is consistent.

### Epic 4: Integrated Translation Grid (inspired by Dango-Translator)

- As a translator, I want spreadsheet view of all text elements so that I can work without viewing images.
- As a translator, I want direct grid editing so that keyboard navigation enables rapid work.
- As a translator, I want status filtering so that progress is trackable.

### Epic 5: Visual Editor & Inpainting

- As a translator, I want rendered text preview on pages so that placement is verified.
- As a translator, I want selectable inpainting method (LaMa, OpenCV.js) so that I control quality/speed.
- As a translator, I want text box manipulation so that text fits speech bubbles.
- As a translator, I want font customization so that style matches manga aesthetics.

### Epic 6: Export & Publishing

- As a translator, I want single-page export as PNG/JPG so that sharing is immediate.
- As a translator, I want chapter export as PDF or ZIP so that complete works are delivered.
- As a translator, I want grid export as CSV so that data backup is maintained.

# 4. System Architecture

This section details the technology stack, high-level architecture, database schema, and security considerations for the Comic Translate Platform. Design decisions incorporate lessons learned from manga-image-translator and Dango-Translator reference implementations.

## 4.1 Technology Stack

The technology stack is based on the project's existing implementation, leveraging modern web technologies with strong TypeScript support and excellent developer experience.

### 4.1.1 Core Framework

| **Component** | **Technology**  | **Version** | **Purpose**                                            |
| ------------- | --------------- | ----------- | ------------------------------------------------------ |
| Framework     | SvelteKit       | 2.50.2      | Full-stack framework with SSR, routing, and API routes |
| UI Library    | Svelte 5        | 5.49.2      | Compile-time reactive UI with runes API                |
| Runtime       | Node.js Adapter | 5.5.2       | Server deployment via @sveltejs/adapter-node           |
| Build Tool    | Vite            | 7.3.1       | Fast development server and production builds          |
| Language      | TypeScript      | 5.9.3       | End-to-end type safety                                 |

_Table 7: Core Framework Stack_

### 4.1.2 Database Layer

| **Component** | **Technology** | **Version** | **Purpose**                                  |
| ------------- | -------------- | ----------- | -------------------------------------------- |
| Database      | PostgreSQL     | Latest      | Relational database for structured data      |
| Driver        | postgres.js    | 3.4.8       | Fast PostgreSQL client with tagged templates |
| ORM           | Drizzle ORM    | 0.45.1      | Type-safe SQL query builder with migrations  |
| Migrations    | Drizzle Kit    | 0.31.8      | Schema management and migration tooling      |

_Table 8: Database Layer Stack_

### 4.1.3 Styling & UI

| **Component**     | **Technology**          | **Version** | **Purpose**                            |
| ----------------- | ----------------------- | ----------- | -------------------------------------- |
| CSS Framework     | Tailwind CSS            | 4.1.18      | Utility-first CSS with JIT compilation |
| Forms Plugin      | @tailwindcss/forms      | 0.5.11      | Pre-styled form elements               |
| Typography Plugin | @tailwindcss/typography | 0.5.19      | Prose styles for rich content          |

_Table 9: Styling Stack_

### 4.1.4 Testing & Quality

| **Component**   | **Technology** | **Version** | **Purpose**                        |
| --------------- | -------------- | ----------- | ---------------------------------- |
| Test Runner     | Vitest         | 4.0.18      | Vite-native unit testing framework |
| Browser Testing | Playwright     | 1.58.1      | Cross-browser E2E testing          |
| Linting         | ESLint         | 9.39.2      | Code quality enforcement           |
| Formatting      | Prettier       | 3.8.1       | Consistent code style              |
| Type Checking   | svelte-check   | 4.3.6       | Svelte TypeScript validation       |

_Table 10: Testing & Quality Stack_

### 4.1.5 External Services

| **Service**    | **Provider**       | **Free Tier**   | **Purpose**                           |
| -------------- | ------------------ | --------------- | ------------------------------------- |
| Authentication | Stack Auth         | 5,000 MAU       | OAuth + email/password authentication |
| File Storage   | Uploadcare         | 3GB storage     | Image upload and CDN delivery         |
| Deployment     | Vercel / Node Host | 100GB bandwidth | Production hosting                    |
| AI Gateway     | OpenRouter         | Free models     | LLM API access (GLM-4, Qwen)          |

_Table 11: External Services Stack_

### 4.1.6 AI/ML Services (User-Selectable)

Following the pattern established by manga-image-translator, the platform supports multiple AI/ML providers with user-selectable options. This flexibility enables users to choose providers based on cost, accuracy, and performance requirements.

| **Capability**      | **Options**                             | **Inspiration Source**                      |
| ------------------- | --------------------------------------- | ------------------------------------------- |
| OCR                 | PaddleOCR, manga-ocr, Tesseract         | manga-image-translator multi-engine support |
| Translation         | OpenRouter, GLM-4, Cohere, Ollama       | Both reference apps multi-provider pattern  |
| Character Detection | Vision models via OpenRouter, Ollama    | Context-aware translation requirement       |
| Inpainting          | LaMa (self-hosted), OpenCV.js (browser) | manga-image-translator inpainting options   |

_Table 12: AI/ML Services Options_

## 4.2 High-Level Architecture

The system follows SvelteKit's full-stack architecture with server-side rendering and API routes. The architecture incorporates lessons from both reference applications: automated pipelines from manga-image-translator and interactive editing from Dango-Translator.

Architecture Components:

1. Client Layer: SvelteKit application with Svelte 5 components. Canvas editor (Fabric.js/Konva.js) for visual editing, TanStack Table for translation grid.
2. API Layer: SvelteKit server routes handling authentication, validation, and orchestration. Server-side rendering for fast initial loads.
3. Data Layer: PostgreSQL accessed through Drizzle ORM. Type-safe queries with full TypeScript inference.
4. AI Service Layer: Abstraction over multiple AI providers following manga-image-translator's modular pattern. User-selectable engines per capability.

## 4.3 Database Schema

The database schema follows a hierarchical structure optimized for manga translation workflow. The design supports both automated processing and interactive editing patterns observed in reference applications.

| **Entity**  | **Key Fields**                                                     | **Description**               |
| ----------- | ------------------------------------------------------------------ | ----------------------------- |
| User        | id, email, displayName, role, createdAt                            | Account information           |
| Project     | id, title, sourceLang, targetLang, status, ownerId                 | Translation project container |
| Chapter     | id, number, title, projectId, pageCount                            | Organizational unit           |
| Page        | id, number, chapterId, imageUrl, width, height, ocrStatus          | Manga page                    |
| TextElement | id, pageId, originalText, translatedText, bbox, fontConfig, status | Detected text                 |
| Glossary    | id, projectId, sourceTerm, targetTerm, notes                       | Terminology (Dango pattern)   |
| AIProvider  | id, userId, provider, apiKey, settings                             | User AI configuration         |

_Table 13: Core Database Entities_

## 4.4 Security & Compliance

- Authentication: Stack Auth with OAuth (Google, LINE) and email/password support.
- Data Protection: HTTPS/TLS 1.3, environment variables for secrets, input validation with Zod.
- Compliance: PDPA Thailand, GDPR consideration, DMCA takedown procedures.

# 5. API Specifications

The API uses SvelteKit server routes with JSON request/response bodies. All routes require authentication via Stack Auth session validation.

## 5.1 REST API Endpoints

| **Method** | **Endpoint**                 | **Description**                 |
| ---------- | ---------------------------- | ------------------------------- |
| POST       | /api/v1/auth/signup          | Create new user account         |
| POST       | /api/v1/auth/signin          | Authenticate via email/password |
| GET        | /api/v1/auth/oauth/:provider | OAuth redirect (google, line)   |
| POST       | /api/v1/auth/signout         | Terminate session               |

_Table 14: Authentication API Endpoints_

| **Method** | **Endpoint**         | **Description**                    |
| ---------- | -------------------- | ---------------------------------- |
| GET        | /api/v1/projects     | List user projects with pagination |
| POST       | /api/v1/projects     | Create new project                 |
| GET        | /api/v1/projects/:id | Get project details with chapters  |
| PUT        | /api/v1/projects/:id | Update project metadata            |
| DELETE     | /api/v1/projects/:id | Delete project and data            |

_Table 15: Project Management API Endpoints_

| **Method** | **Endpoint**                      | **Description**                                  |
| ---------- | --------------------------------- | ------------------------------------------------ |
| POST       | /api/v1/chapters/:id/pages/upload | Upload pages (ZIP support)                       |
| POST       | /api/v1/pages/:id/ocr             | Trigger OCR (async, engine selectable)           |
| POST       | /api/v1/pages/:id/translate       | Trigger translation (async, provider selectable) |
| POST       | /api/v1/pages/:id/inpaint         | Trigger inpainting (async, method selectable)    |
| GET        | /api/v1/pages/:id/elements        | Get all text elements                            |
| PUT        | /api/v1/elements/:id              | Update text element                              |
| PUT        | /api/v1/elements/batch            | Batch update elements                            |
| GET        | /api/v1/pages/:id/export          | Export page as image                             |

_Table 16: Page & Text Element API Endpoints_

## 5.2 Third-Party Integrations

| **Service**    | **Provider**          | **Purpose**          |
| -------------- | --------------------- | -------------------- |
| Authentication | Stack Auth            | User auth & sessions |
| File Storage   | Uploadcare            | Image upload & CDN   |
| Database       | PostgreSQL + Drizzle  | Data persistence     |
| AI Gateway     | OpenRouter            | LLM API access       |
| OCR            | PaddleOCR / manga-ocr | Text detection       |
| Inpainting     | LaMa / OpenCV.js      | Text removal         |

_Table 17: Third-Party Service Integrations_

# 6. Technical Risks & Mitigation

| **Risk**                     | **Impact**     | **Mitigation**                                              |
| ---------------------------- | -------------- | ----------------------------------------------------------- |
| OCR accuracy for manga fonts | Poor detection | Multiple OCR options (manga-ocr pattern); manual correction |
| AI API costs scaling         | Budget overrun | Free tier models; self-hosted Ollama; usage quotas          |
| Image processing latency     | Poor UX        | Async processing with progress indicators (Dango pattern)   |
| Canvas editor compatibility  | Browser issues | Feature detection; progressive enhancement                  |
| Copyright liability          | Legal exposure | ToS clarity; user responsibility; DMCA process              |

_Table 18: Technical Risks and Mitigation_

# 7. Development Setup

## 7.1 Available Scripts

| **Script**  | **Command**        | **Purpose**                     |
| ----------- | ------------------ | ------------------------------- |
| Development | npm run dev        | Start Vite development server   |
| Build       | npm run build      | Create production build         |
| Type Check  | npm run check      | Run svelte-check for TypeScript |
| Lint        | npm run lint       | Run ESLint and Prettier         |
| Test        | npm run test       | Run Vitest unit tests           |
| DB Push     | npm run db:push    | Push schema changes to database |
| DB Migrate  | npm run db:migrate | Run Drizzle migrations          |
| DB Studio   | npm run db:studio  | Open Drizzle Studio             |

_Table 19: Available NPM Scripts_

# 8. References

## 8.1 Reference Sample Applications

[1] manga-image-translator - https://github.com/zyddnys/manga-image-translator

[2] Dango-Translator - https://github.com/PantsuDango/Dango-Translator

## 8.2 Technical Documentation

[3] SvelteKit Documentation - https://kit.svelte.dev/docs

[4] Drizzle ORM Documentation - https://orm.drizzle.team/docs/overview

[5] Tailwind CSS v4 - https://tailwindcss.com/docs

[6] Vitest Documentation - https://vitest.dev/guide/

[7] Stack Auth Documentation - https://stack-auth.com/docs

[8] Uploadcare Documentation - https://uploadcare.com/docs/

[9] OpenRouter API - https://openrouter.ai/docs

[10] PaddleOCR - https://github.com/PaddlePaddle/PaddleOCR

[11] manga-ocr - https://github.com/kha-white/manga-ocr

[12] LaMa Inpainting - https://github.com/advimman/lama

_Document prepared by Nexus - Systems Analyst & Project Manager_

_Version 5.0 | February 17, 2026_
