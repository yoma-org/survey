// Loading skeleton shown while Server Component runs token validation
export default function SurveyLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading your survey...</p>
      </div>
    </div>
  );
}
