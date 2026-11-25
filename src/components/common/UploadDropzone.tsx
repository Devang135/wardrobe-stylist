import { useCallback } from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/cn';

interface UploadDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  onFilesRejected?: (message: string) => void;
  multiple?: boolean;
  maxSizeBytes?: number;
  accept?: Accept;
  title?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_ACCEPT: Accept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export function UploadDropzone({
  onFilesAccepted,
  onFilesRejected,
  multiple = false,
  maxSizeBytes = 10 * 1024 * 1024,
  accept = DEFAULT_ACCEPT,
  title = 'Drop image files here, or click to browse',
  description = 'Supports JPG, PNG, and WebP up to 10 MB per file',
  disabled = false,
  className,
}: UploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        onFilesAccepted(acceptedFiles);
      }
      if (rejectedFiles.length > 0 && onFilesRejected) {
        const firstError = rejectedFiles[0]?.errors[0]?.message ?? 'One or more files were rejected.';
        onFilesRejected(firstError);
      }
    },
    [onFilesAccepted, onFilesRejected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxSize: maxSizeBytes,
    accept,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-strong bg-surface/70 px-6 py-8 text-center transition-colors hover:border-accent/60 hover:bg-accent-soft/20',
        isDragActive && 'border-accent bg-accent-soft/30',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input {...getInputProps()} aria-label={title} />
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-accent">
        <UploadCloud className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-ink">{isDragActive ? 'Drop to attach' : title}</p>
      <p className="mt-1 text-xs text-ink-muted">{description}</p>
    </div>
  );
}
