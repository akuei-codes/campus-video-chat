
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadProfilePhoto } from "@/lib/supabase";
import { toast } from "sonner";
import { User, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  userId: string;
  existingPhotos: string[];
  onPhotosChange: (photos: string[]) => void;
  avatarUrl?: string;
  onAvatarChange?: (url: string) => void;
  maxPhotos?: number;
  className?: string;
}

const PhotoUpload = ({
  userId,
  existingPhotos = [],
  onPhotosChange,
  avatarUrl,
  onAvatarChange,
  maxPhotos = 4,
  className,
}: PhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length) return;
    
    try {
      setIsUploading(true);
      
      const file = event.target.files[0];
      const index = photos.length;
      
      if (index >= maxPhotos) {
        toast.error(`Maximum ${maxPhotos} photos allowed`);
        return;
      }
      
      const url = await uploadProfilePhoto(userId, file, index);
      const updatedPhotos = [...photos, url];
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos);
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const handleAvatarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length || !onAvatarChange) return;
    
    try {
      setIsUploading(true);
      const file = event.target.files[0];
      const url = await uploadProfilePhoto(userId, file, 'avatar');
      onAvatarChange(url);
      toast.success("Profile picture updated");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to update profile picture. Please try again.");
    } finally {
      setIsUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };
  
  const removePhoto = (indexToRemove: number) => {
    const updatedPhotos = photos.filter((_, index) => index !== indexToRemove);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {onAvatarChange && (
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24 border-2 border-ivy">
            <AvatarImage src={avatarUrl} alt="Profile" />
            <AvatarFallback className="bg-ivy text-ivy-foreground">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploading}
          >
            {avatarUrl ? "Change Profile Picture" : "Add Profile Picture"}
          </Button>
          <input
            ref={avatarInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarSelect}
            disabled={isUploading}
          />
        </div>
      )}
      
      <div className="space-y-2">
        <div className="photo-grid">
          {Array.from({ length: maxPhotos }).map((_, index) => (
            <div 
              key={index}
              className="relative aspect-square rounded-md overflow-hidden border border-dashed border-gray-300 flex items-center justify-center bg-gray-50"
            >
              {index < photos.length ? (
                <>
                  <img
                    src={photos[index]}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70 transition-colors"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {index === photos.length && !isUploading ? (
                    <span className="text-sm font-medium">+ Add Photo</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Empty</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handlePhotoSelect}
          disabled={isUploading || photos.length >= maxPhotos}
        />
        
        <p className="text-xs text-muted-foreground mt-2">
          Upload up to {maxPhotos} photos to showcase yourself
        </p>
      </div>
    </div>
  );
};

export default PhotoUpload;
