'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { toast } from 'react-hot-toast';
import { useValidationStore } from '@/store/validationStore';
import { Upload, X, FileCode } from 'lucide-react';
import { isCodeFile, formatFileSize } from '@/lib/utils';

export default function ManualValidationPage() {
  const router = useRouter();
  const { createManualValidation, loading } = useValidationStore();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      isCodeFile(file.name)
    );

    if (droppedFiles.length === 0) {
      toast.error('Please upload code files only');
      return;
    }

    if (files.length + droppedFiles.length > 20) {
      toast.error('Maximum 20 files allowed');
      return;
    }

    setFiles((prev) => [...prev, ...droppedFiles]);
  }, [files.length]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter((file) =>
      isCodeFile(file.name)
    );

    if (selectedFiles.length === 0) {
      toast.error('Please select code files only');
      return;
    }

    if (files.length + selectedFiles.length > 20) {
      toast.error('Maximum 20 files allowed');
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    try {
      const validationId = await createManualValidation(files);
      toast.success('Codebird is reviewing your files');
      router.push(`/validations/${validationId}`);
    } catch (error) {
      toast.error('Codebird could not start that review');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink-800">New review</h1>
          <p className="mt-1 text-ink-500">
            Drop files here. Codebird reads them, then tells you what to fix.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hand Codebird a file</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload
                className={`mx-auto h-12 w-12 ${
                  isDragging ? 'text-primary-500' : 'text-gray-400'
                }`}
              />
              <p className="mt-4 text-sm text-gray-600">
                Drag and drop your code files here, or
              </p>
              <label className="mt-2 inline-block">
                <span className="text-primary-600 hover:text-primary-700 cursor-pointer font-medium">
                  browse files
                </span>
                <input
                  type="file"
                  multiple
                  accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.rb,.php,.swift,.kt,.rs,.scala,.html,.css,.scss,.vue,.svelte"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">
                Maximum 20 files, up to 10MB each
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Selected files ({files.length}/20)
                </p>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileCode className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={files.length === 0 || loading}
                isLoading={loading}
                className="flex-1"
              >
                Ask Codebird to review
              </Button>
              <Button
                variant="outline"
                onClick={() => setFiles([])}
                disabled={files.length === 0}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
