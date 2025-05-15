
import { PolicyDocument } from "@/lib/chatpdf-types";
import { X } from "lucide-react";

interface DocumentPreviewProps {
  document: PolicyDocument;
  onRemove: (id: string) => void;
}

const DocumentPreview = ({ document, onRemove }: DocumentPreviewProps) => {
  const renderPreview = () => {
    if (document.type === "file" && document.previewUrl) {
      if (document.file?.type === "application/pdf") {
        return (
          <div className="h-24 md:h-32 w-20 md:w-24 bg-gray-100 flex items-center justify-center rounded">
            <span className="text-xs font-medium">PDF</span>
          </div>
        );
      } else if (document.file?.type.startsWith("image/")) {
        return (
          <img
            src={document.previewUrl}
            alt={document.name}
            className="h-24 md:h-32 object-cover rounded"
          />
        );
      }
    }

    return (
      <div className="h-24 md:h-32 w-full bg-gray-100 p-2 overflow-hidden rounded">
        <p className="text-xs line-clamp-6">
          {document.content ? document.content.substring(0, 150) + "..." : "Text document"}
        </p>
      </div>
    );
  };

  return (
    <div className="relative group border rounded-md p-2 md:p-3 bg-white">
      <button
        onClick={() => onRemove(document.id)}
        className="absolute top-1 md:top-2 right-1 md:right-2 bg-white rounded-full p-1 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
      </button>
      
      <div className="flex flex-col gap-2">
        {renderPreview()}
        
        <div className="mt-1 md:mt-2">
          <p className="font-medium text-xs md:text-sm truncate">{document.name}</p>
          <div className="flex items-center mt-1">
            <span 
              className={`text-xs px-2 py-0.5 rounded-full ${
                document.status === "ready" 
                  ? "bg-green-100 text-green-800" 
                  : document.status === "error"
                  ? "bg-red-100 text-red-800"
                  : document.status === "processing"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
