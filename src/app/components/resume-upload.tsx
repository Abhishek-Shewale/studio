'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploadProps {
  onResumeUpload: (file: File) => void;
  onResumeRemove: () => void;
  uploadedResume: File | null;
  className?: string;
}

export function ResumeUpload({
  onResumeUpload,
  onResumeRemove,
  uploadedResume,
  className,
}: ResumeUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      onResumeUpload(file);
      toast({
        title: 'PDF Uploaded',
        description: 'PDF file uploaded successfully. AI will extract the content.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF file. For Word documents, please convert to PDF first.',
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveResume = () => {
    onResumeRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('h-full', className)}>
      {!uploadedResume ? (
        /* Upload Section */
        <Card className="shadow-none border-0 md:border md:shadow-lg h-full flex flex-col">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg font-bold">Upload Resume</CardTitle>
            <CardDescription className="text-sm">
              Upload your resume to get personalized interview questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex-1 flex items-center justify-center">
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors w-full',
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your resume here, or click to browse
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supports PDF files (convert Word docs to PDF first)
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Resume Preview Section */
        <Card className="shadow-none border-0 md:border md:shadow-lg h-full flex flex-col">
          <CardHeader className="pb-2 pt-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Resume Preview</CardTitle>
                <CardDescription className="text-sm">
                  Preview of your uploaded resume
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveResume}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 pt-2">
            <div className="h-full overflow-hidden bg-white relative">
              <iframe
                src={`${URL.createObjectURL(uploadedResume)}#toolbar=0&navpanes=0&scrollbar=0&view=FitV&zoom=FitV&pagemode=none&disableprint=1&disablesave=1`}
                className="w-full h-full border-0 rounded-lg"
                title="Resume Preview"
                style={{ 
                  backgroundColor: 'white',
                  transform: 'scale(1)',
                  transformOrigin: 'top left',
                  overflow: 'hidden'
                }}
                scrolling="no"
                onLoad={(e) => {
                  // Force fit to page after load and set white background
                  const iframe = e.target as HTMLIFrameElement;
                  iframe.style.width = '100%';
                  iframe.style.height = '100%';
                  iframe.style.backgroundColor = 'white';
                  iframe.style.overflow = 'hidden';
                  
                  // Try to access iframe content and set background
                  try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc) {
                      iframeDoc.body.style.backgroundColor = 'white';
                      iframeDoc.body.style.overflow = 'hidden';
                      iframeDoc.documentElement.style.backgroundColor = 'white';
                      iframeDoc.documentElement.style.overflow = 'hidden';
                    }
                  } catch (error) {
                    // Cross-origin restrictions might prevent this
                    console.log('Cannot access iframe content due to CORS');
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
