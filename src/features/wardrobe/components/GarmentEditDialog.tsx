import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDialog } from '@/components/common/FormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORY_SINGULAR } from '@/lib/format';
import type { Garment, GarmentCategory } from '@/types';

const editGarmentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  category: z.enum([
    'TOP',
    'BOTTOM',
    'ONE_PIECE',
    'OUTERWEAR',
    'FOOTWEAR',
    'ACCESSORY',
    'TRADITIONAL',
  ]),
  subcategory: z.string().min(1, 'Subcategory is required'),
  color: z.string().min(1, 'Color is required'),
  pattern: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  styleTagsText: z.string(),
  occasionTagsText: z.string(),
  seasonTagsText: z.string(),
  notes: z.string().optional(),
});

type EditGarmentValues = z.infer<typeof editGarmentSchema>;

interface GarmentEditDialogProps {
  garment: Garment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving?: boolean;
  onSave: (id: string, patch: Partial<Garment>) => Promise<void>;
}

const CATEGORIES: GarmentCategory[] = [
  'TOP',
  'BOTTOM',
  'ONE_PIECE',
  'OUTERWEAR',
  'FOOTWEAR',
  'ACCESSORY',
  'TRADITIONAL',
];

export function GarmentEditDialog({
  garment,
  open,
  onOpenChange,
  isSaving = false,
  onSave,
}: GarmentEditDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditGarmentValues>({
    resolver: zodResolver(editGarmentSchema),
  });

  useEffect(() => {
    if (garment) {
      reset({
        name: garment.name,
        category: garment.category,
        subcategory: garment.subcategory,
        color: garment.color,
        pattern: garment.pattern ?? '',
        brand: garment.brand ?? '',
        size: garment.size ?? '',
        material: garment.material ?? '',
        styleTagsText: garment.styleTags.join(', '),
        occasionTagsText: garment.occasionTags.join(', '),
        seasonTagsText: garment.seasonTags.join(', '),
        notes: garment.notes ?? '',
      });
    }
  }, [garment, reset]);

  const splitTags = (raw: string) =>
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const onSubmit = async (values: EditGarmentValues) => {
    if (!garment) return;
    await onSave(garment.id, {
      name: values.name,
      category: values.category,
      subcategory: values.subcategory,
      color: values.color,
      pattern: values.pattern || undefined,
      brand: values.brand || undefined,
      size: values.size || undefined,
      material: values.material || undefined,
      styleTags: splitTags(values.styleTagsText),
      occasionTags: splitTags(values.occasionTagsText),
      seasonTags: splitTags(values.seasonTagsText),
      notes: values.notes || undefined,
    });
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit garment details"
      description="Update metadata, tags, and notes for your wardrobe catalogue."
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="edit-garment-name">Item name</Label>
            <Input id="edit-garment-name" {...register('name')} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-garment-category">Category</Label>
            <Select
              value={watch('category')}
              onValueChange={(val) => setValue('category', val as GarmentCategory)}
            >
              <SelectTrigger id="edit-garment-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_SINGULAR[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-garment-sub">Subcategory</Label>
            <Input id="edit-garment-sub" {...register('subcategory')} />
            {errors.subcategory && (
              <p className="text-xs text-danger">{errors.subcategory.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-garment-color">Color</Label>
            <Input id="edit-garment-color" {...register('color')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-garment-pattern">Pattern</Label>
            <Input id="edit-garment-pattern" placeholder="Solid, Striped..." {...register('pattern')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-garment-brand">Brand</Label>
            <Input id="edit-garment-brand" {...register('brand')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-garment-size">Size</Label>
            <Input id="edit-garment-size" {...register('size')} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="edit-garment-material">Material</Label>
            <Input id="edit-garment-material" {...register('material')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-garment-style">Style tags (comma-separated)</Label>
            <Input id="edit-garment-style" {...register('styleTagsText')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-garment-occasion">Occasion tags</Label>
            <Input id="edit-garment-occasion" {...register('occasionTagsText')} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="edit-garment-season">Season tags</Label>
            <Input id="edit-garment-season" {...register('seasonTagsText')} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="edit-garment-notes">Notes</Label>
            <Textarea id="edit-garment-notes" {...register('notes')} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
