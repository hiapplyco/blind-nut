# Even a blind nut can find a Purple Squirrel

A powerful AI-driven search tool that helps recruiters and hiring managers generate optimized search strings and analyze job requirements.

## Key Features

- **AI-Powered Search String Generation**: Convert job descriptions and requirements into optimized search strings
- **Audio Input Support**: Record interviews or job requirements directly through voice input
- **PDF Document Support**: Upload and parse PDF resumes and job descriptions
- **Real-time Analysis**: Get instant insights about job requirements and candidate matches
- **Secure Data Handling**: Enterprise-grade security with Supabase authentication and storage

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **AI Integration**: Google Gemini API
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **File Storage**: Supabase Storage

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```
4. Run the development server: `npm run dev`

## Key Components

- **SearchForm**: Main component for input handling (text, audio, PDF)
- **CaptureWindow**: Audio recording and processing
- **SearchResults**: Display and management of search results
- **AgentWindow**: AI analysis and processing interface

## Security Features

- Row Level Security (RLS) policies in Supabase
- Secure file storage with access control
- Protected API endpoints
- User authentication and authorization

## Support

For issues or questions, please contact support at support@lovable.dev

## License

This project is proprietary and confidential. All rights reserved.