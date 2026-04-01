// 404 — token does not exist
import { AlertCircle } from 'lucide-react';

export default function SurveyNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-md px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Survey link not found</h1>
        <p className="text-sm text-gray-500">
          This survey link does not exist or has expired. Please contact your administrator for a new link.
        </p>
      </div>
    </div>
  );
}
