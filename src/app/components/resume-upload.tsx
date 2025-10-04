'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploadProps {
  onResumeUpload: (file: File) => void;
  onResumeRemove: () => void;
  uploadedResume: File | null;
  className?: string;
  isParsing?: boolean;
}

export function ResumeUpload({
  onResumeUpload,
  onResumeRemove,
  uploadedResume,
  className,
  isParsing = false,
}: ResumeUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      onResumeUpload(file);
      toast({
        title: 'PDF Uploaded',
        description: 'PDF file uploaded successfully. AI is extracting the content...',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Only PDF files are supported. Word documents (.doc, .docx) cannot be processed.',
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

  const handleRemoveResume = useCallback(() => {
    onResumeRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onResumeRemove]);

  // Memoize the iframe URL to prevent unnecessary re-renders
  const iframeUrl = useMemo(() => {
    if (!uploadedResume) return null;
    return `${URL.createObjectURL(uploadedResume)}#toolbar=0&navpanes=0&scrollbar=0&view=FitV&zoom=FitV&pagemode=none&disableprint=1&disablesave=1`;
  }, [uploadedResume]);

  // Memoize the iframe onLoad handler
  const handleIframeLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement>) => {
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
  }, []);

  return (
    <div className={cn('h-full', className)}>
      {!uploadedResume ? (
        /* Upload Section */
        <Card className="shadow-none border-0 md:border md:shadow-lg h-full flex flex-col">
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-lg font-bold">Upload Resume (PDF Only)</CardTitle>
            <CardDescription className="text-sm">
              Upload your resume in PDF format to get personalized interview questions.
            </CardDescription>
          </CardHeader> 
          <CardContent className="pt-0 flex-1 flex items-center justify-center">
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
                Drag and drop your PDF resume here, or click to browse
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">
                PDF files only*
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
                  {isParsing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI is extracting information from your resume...
                    </span>
                  ) : (
                    'Preview of your uploaded resume'
                  )}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveResume}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                disabled={isParsing}
              >
                {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 pt-2">
            <div className="h-full overflow-hidden bg-white relative">
              {iframeUrl && (
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title="Resume Preview"
                  style={{ 
                    backgroundColor: 'white',
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                    overflow: 'hidden'
                  }}
                  scrolling="no"
                  onLoad={handleIframeLoad}
                />
              )}
              {isParsing && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Parsing resume...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
