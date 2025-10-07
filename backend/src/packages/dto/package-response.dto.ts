export class PackageResponseDto {
  id: string;
  displayName: string;
  description?: string;
  basePrice: number;
  durationHrs: number;
  maxPhotos?: number;
  isActive: boolean;
}