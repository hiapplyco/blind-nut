# Interview Preparation Room Refactor Plan

## Executive Summary
Transform the current Interview Preparation Room into a comprehensive "Kickoff Call" experience that combines multimodal input capabilities, dynamic interview guidance, and real-time content creation with dashboard visualizations.

## Current Issues to Address
1. **Transparency Issues**: Dropdown menu has transparency problems making it difficult to read
2. **Limited Interview Types**: Only shows Behavioral Interview and STAR Method options
3. **No File Upload**: Missing capability to upload context files (resumes, job descriptions)
4. **No Multimodal Input**: Lacks audio/video recording capabilities
5. **Static Experience**: No dynamic, chat-driven interview guidance
6. **No Data Visualization**: Missing dashboard and analytics capabilities

## Proposed Architecture

### 1. **Unified Kickoff Call Page**
Consolidate all interview-related functionality into a single, dynamic page with multiple modes:

```
Kickoff Call Page
├── Interview Setup Mode
│   ├── Context Upload (Files, Audio, Video)
│   ├── Interview Type Selection (Expanded)
│   └── Requirements Definition
├── Live Interview Mode
│   ├── Real-time Chat Interface
│   ├── Audio/Video Recording
│   ├── Dynamic Question Suggestions
│   └── "Choose Your Adventure" Guidance
└── Analysis & Content Mode
    ├── Interview Dashboard
    ├── Content Generation
    └── Insights & Visualizations
```

### 2. **Enhanced Interview Types**
Expand beyond Behavioral/STAR to include:
- **Technical Interview** (coding, system design, architecture)
- **Case Study Interview** (business problems, analytical)
- **Cultural Fit Interview** (values, team dynamics)
- **Panel Interview** (multiple interviewers)
- **Phone/Video Screening** (initial assessment)
- **Executive Interview** (leadership, strategy)
- **Competency-Based** (specific skill validation)
- **Stress Interview** (pressure testing)
- **Group Interview** (multiple candidates)
- **Custom Framework** (user-defined structure)

### 3. **Multimodal Input System**

#### File Upload Integration
- Reuse existing `parse-document` edge function
- Support all document types: PDF, DOCX, TXT, RTF, ODT
- Parse resumes, job descriptions, company docs
- Extract key requirements and skills

#### Audio/Video Capabilities
- Integrate existing audio capture from Search component
- Add video recording using WebRTC/MediaRecorder API
- Real-time transcription via `transcribe-whisper` edge function
- Support for uploaded audio/video files

### 4. **Dynamic Interview Chat System**

#### Chat Interface
- Real-time messaging UI (similar to ChatGPT/Claude)
- Persistent conversation history
- Context-aware responses based on uploaded materials
- Voice-to-text input option

#### "Choose Your Adventure" Logic
```typescript
interface InterviewNode {
  id: string;
  question: string;
  possibleResponses: ResponseOption[];
  followUpStrategy: FollowUpRule[];
  scoringCriteria: ScoringRule[];
}

interface ResponseOption {
  type: 'positive' | 'negative' | 'neutral' | 'red_flag';
  keywords: string[];
  nextNodeId: string;
  suggestedFollowUp: string;
}
```

#### AI-Driven Guidance
- Real-time analysis of candidate responses
- Dynamic question recommendations
- Skill gap identification
- Red flag detection
- Conversation flow optimization

### 5. **Content Generation & Dashboard**

#### Real-time Content Creation
- Interview summary generation
- Key insights extraction
- Candidate evaluation report
- Recommended next steps
- Shareable interview notes

#### Dashboard Visualizations
- **Interview Progress Tracker**: Visual representation of covered topics
- **Skill Assessment Matrix**: Spider chart of evaluated competencies
- **Response Quality Metrics**: Sentiment analysis, clarity scores
- **Time Analytics**: Question duration, topic coverage
- **Comparison Views**: Multiple candidates side-by-side

### 6. **Technical Implementation Plan**

#### Frontend Components to Refactor/Create
```
src/components/interview/
├── KickoffCallPage.tsx (main container)
├── InterviewSetup/
│   ├── ContextUpload.tsx
│   ├── InterviewTypeSelector.tsx
│   └── RequirementsBuilder.tsx
├── LiveInterview/
│   ├── ChatInterface.tsx
│   ├── MediaRecorder.tsx
│   ├── QuestionSuggestions.tsx
│   └── InterviewGuide.tsx
└── Analytics/
    ├── InterviewDashboard.tsx
    ├── ContentGenerator.tsx
    └── Visualizations/
        ├── ProgressTracker.tsx
        ├── SkillMatrix.tsx
        └── ResponseMetrics.tsx
```

#### Backend Integration
- Leverage existing edge functions:
  - `parse-document` for file processing
  - `transcribe-whisper` for audio transcription
  - `process-kickoff-call` for interview processing
  - `generate-clarvida-report` for analysis
- Create new edge functions:
  - `interview-chat` for real-time guidance
  - `analyze-interview-response` for dynamic routing
  - `generate-interview-content` for reports

#### State Management
```typescript
interface InterviewState {
  // Setup
  role: string;
  requirements: string;
  interviewType: InterviewType;
  contextFiles: UploadedFile[];
  
  // Live Session
  currentNode: InterviewNode;
  conversationHistory: Message[];
  recordingStatus: RecordingState;
  suggestedQuestions: Question[];
  
  // Analytics
  coveredTopics: Topic[];
  skillAssessments: SkillScore[];
  insights: Insight[];
  generatedContent: Content[];
}
```

### 7. **UI/UX Improvements**

#### Fix Transparency Issues
```css
/* Ensure solid backgrounds for all dropdowns */
.dropdown-menu {
  background-color: white;
  backdrop-filter: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

#### Responsive Design
- Mobile-first approach
- Collapsible panels for different modes
- Touch-friendly controls for tablet use
- Keyboard shortcuts for power users

#### Visual Enhancements
- Progress indicators during processing
- Smooth transitions between modes
- Clear visual hierarchy
- Consistent theming with existing design

### 8. **Integration Points**

#### With Existing Features
- **Search/Sourcing**: Import candidate profiles directly
- **Saved Candidates**: Link interviews to candidate records
- **Compensation Analysis**: Include salary discussions
- **Boolean Search**: Generate role-specific searches

#### Database Schema Updates
```sql
-- Interview sessions table
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role_title TEXT,
  interview_type TEXT,
  context_data JSONB,
  conversation_history JSONB,
  analytics_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview templates
CREATE TABLE interview_templates (
  id UUID PRIMARY KEY,
  name TEXT,
  type TEXT,
  question_tree JSONB,
  scoring_rules JSONB,
  is_public BOOLEAN DEFAULT false
);
```

### 9. **Development Phases**

#### Phase 1: Foundation (Week 1)
- Fix transparency issues
- Add expanded interview types
- Implement file upload capability
- Basic chat interface

#### Phase 2: Multimodal (Week 2)
- Audio recording integration
- Video recording support
- Real-time transcription
- Media file uploads

#### Phase 3: Intelligence (Week 3)
- Dynamic question routing
- AI-driven suggestions
- Response analysis
- Red flag detection

#### Phase 4: Analytics (Week 4)
- Dashboard creation
- Visualization components
- Content generation
- Export capabilities

#### Phase 5: Polish (Week 5)
- Performance optimization
- Mobile responsiveness
- User testing
- Documentation

### 10. **Success Metrics**
- **Setup Time**: < 2 minutes to start interview
- **Question Coverage**: 95% of required topics
- **User Satisfaction**: 4.5+ star rating
- **Time Saved**: 50% reduction in post-interview work
- **Insight Quality**: Actionable recommendations in 90% of sessions

## Conclusion
This refactor will transform the Interview Preparation Room into a comprehensive, AI-driven interview platform that guides users through effective interviews while automatically generating valuable content and insights. The unified "Kickoff Call" experience will streamline the entire interview process from preparation to analysis.