import { Heart, MoreVertical, Pencil, Sparkles, Trash2, Archive, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn } from '@/lib/cn';
import type { Garment } from '@/types';

interface GarmentCardProps {
  garment: Garment;
  viewMode?: 'grid' | 'list';
  onToggleFavorite: (id: string) => void;
  onEdit: (garment: Garment) => void;
  onAddToStudio: (garment: Garment) => void;
  onArchive: (garment: Garment) => void;
  onDelete: (garment: Garment) => void;
}

export function GarmentCard({
  garment,
  viewMode = 'grid',
  onToggleFavorite,
  onEdit,
  onAddToStudio,
  onArchive,
  onDelete,
}: GarmentCardProps) {
  const showStatusBadge = garment.status !== 'READY';

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-3.5 shadow-card transition-shadow hover:shadow-elevated">
        <div className="flex min-w-0 items-center gap-3.5">
          <Link to={`/app/wardrobe/${garment.id}`} className="shrink-0">
            <ImageWithFallback
              src={garment.imageUrl}
              alt={garment.name}
              className="h-16 w-16 rounded-xl bg-surface-muted/60 object-contain p-1"
            />
          </Link>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/app/wardrobe/${garment.id}`}
                className="truncate text-sm font-semibold text-ink hover:text-accent"
              >
                {garment.name}
              </Link>
              {showStatusBadge && <StatusBadge status={garment.status} />}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <span>{garment.subcategory}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="h-2.5 w-2.5 rounded-full border border-black/15"
                  style={{ backgroundColor: garment.colorHex }}
                />
                {garment.color}
              </span>
              {garment.brand && (
                <>
                  <span>·</span>
                  <span>{garment.brand}</span>
                </>
              )}
              <span>·</span>
              <span>{garment.wearCount} wears</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label={garment.favorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => onToggleFavorite(garment.id)}
          >
            <Heart
              className={cn(
                'h-4 w-4',
                garment.favorite ? 'fill-accent text-accent' : 'text-ink-subtle',
              )}
            />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddToStudio(garment)}>
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Style</span>
          </Button>
          <GarmentMenu
            garment={garment}
            onEdit={onEdit}
            onAddToStudio={onAddToStudio}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all hover:border-accent/40 hover:shadow-elevated">
      <div className="relative aspect-[4/4.3] w-full bg-surface-muted/45 p-3">
        <Link to={`/app/wardrobe/${garment.id}`} className="block h-full w-full">
          <ImageWithFallback
            src={garment.imageUrl}
            alt={garment.name}
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
          />
        </Link>

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          {showStatusBadge && <StatusBadge status={garment.status} />}
        </div>

        <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleFavorite(garment.id)}
            aria-label={garment.favorite ? 'Remove from favorites' : 'Add to favorites'}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/90 text-ink shadow-sm backdrop-blur-sm transition-colors hover:bg-surface"
          >
            <Heart
              className={cn(
                'h-4 w-4',
                garment.favorite ? 'fill-accent text-accent' : 'text-ink-muted',
              )}
            />
          </button>
          <GarmentMenu
            garment={garment}
            onEdit={onEdit}
            onAddToStudio={onAddToStudio}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2.5">
        <div className="space-y-1">
          <Link
            to={`/app/wardrobe/${garment.id}`}
            className="line-clamp-1 text-sm font-semibold text-ink hover:text-accent"
          >
            {garment.name}
          </Link>
          <p className="text-xs text-ink-muted">
            {garment.subcategory}
            {garment.brand ? ` · ${garment.brand}` : ''}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-ink-muted">
            <span
              className="h-2.5 w-2.5 rounded-full border border-black/15"
              style={{ backgroundColor: garment.colorHex }}
            />
            {garment.color}
          </span>
          <span className="text-[11px] text-ink-subtle">{garment.wearCount} wears</span>
        </div>
      </div>
    </div>
  );
}

function GarmentMenu({
  garment,
  onEdit,
  onAddToStudio,
  onArchive,
  onDelete,
}: {
  garment: Garment;
  onEdit: (g: Garment) => void;
  onAddToStudio: (g: Garment) => void;
  onArchive: (g: Garment) => void;
  onDelete: (g: Garment) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for ${garment.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface/90 text-ink-muted shadow-sm backdrop-blur-sm transition-colors hover:bg-surface hover:text-ink"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/app/wardrobe/${garment.id}`}>
            <Eye className="h-4 w-4 text-ink-muted" />
            <span>View details</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(garment)}>
          <Pencil className="h-4 w-4 text-ink-muted" />
          <span>Edit metadata</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddToStudio(garment)}>
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Add to Outfit Studio</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {garment.status !== 'ARCHIVED' && (
          <DropdownMenuItem onClick={() => onArchive(garment)}>
            <Archive className="h-4 w-4 text-ink-muted" />
            <span>Archive</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onDelete(garment)}
          className="text-danger focus:text-danger"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
