import { AlertCircle, CheckCircle2, Clock, Loader2, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ProcessingStatus } from '@/types';

type AvatarStatus = 'NOT_STARTED' | 'UPLOADED' | 'GENERATING' | 'READY' | 'FAILED';

interface StatusBadgeProps {
  status: ProcessingStatus | AvatarStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'READY':
      return (
        <Badge variant="sage">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          <span>Ready</span>
        </Badge>
      );
    case 'PROCESSING':
    case 'GENERATING':
    case 'UPLOADING':
      return (
        <Badge variant="accent">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          <span>
            {status === 'UPLOADING'
              ? 'Uploading'
              : status === 'GENERATING'
                ? 'Generating'
                : 'Processing'}
          </span>
        </Badge>
      );
    case 'PENDING':
    case 'UPLOADED':
      return (
        <Badge variant="warning">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>{status === 'UPLOADED' ? 'Uploaded' : 'Pending'}</span>
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge variant="danger">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          <span>Failed</span>
        </Badge>
      );
    case 'ARCHIVED':
      return (
        <Badge variant="outline">
          <Archive className="h-3 w-3" aria-hidden="true" />
          <span>Archived</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="default">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>Not set</span>
        </Badge>
      );
  }
}
