
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "./MultiSelect";
import PhotoUpload from "./PhotoUpload";
import { Profile, User, UNIVERSITIES, INTERESTS } from "@/types";
import { createProfile, updateProfile, getProfile } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const graduationYears = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i - 4).map(String);

const profileSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  university: z.string().min(1, { message: "Please select your university" }),
  major: z.string().min(1, { message: "Please enter your major" }),
  graduation_year: z.string().min(1, { message: "Please select your graduation year" }),
  bio: z.string().max(300, { message: "Bio must be 300 characters or less" }).optional(),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say"]),
  interests: z.array(z.string()).min(1, { message: "Select at least one interest" }).max(10, { message: "Maximum 10 interests" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
  onComplete?: () => void;
}

const ProfileForm = ({ user, onComplete }: ProfileFormProps) => {
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.user_metadata?.avatar_url);
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user.user_metadata?.full_name || "",
      university: "",
      major: "",
      graduation_year: new Date().getFullYear().toString(),
      bio: "",
      gender: "Prefer not to say",
      interests: [],
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile(user.id);
        if (profile) {
          setExistingProfile(profile);
          setAvatarUrl(profile.avatar_url);
          setPhotos(profile.additional_photos || []);
          
          form.reset({
            full_name: profile.full_name,
            university: profile.university,
            major: profile.major,
            graduation_year: profile.graduation_year,
            bio: profile.bio || "",
            gender: profile.gender as any || "Prefer not to say",
            interests: profile.interests || [],
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [user, form]);

  // Function to handle avatar changes and immediately update the profile
  const handleAvatarChange = async (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
    
    try {
      // Only update the avatar field if profile already exists
      if (existingProfile) {
        await updateProfile({
          id: existingProfile.id,
          avatar_url: newAvatarUrl,
        });
      } else {
        // If no profile exists yet, collect the form data and create one
        const formValues = form.getValues();
        const isFormValid = await form.trigger();
        
        if (isFormValid) {
          const newProfile = await createProfile({
            ...formValues,
            user_id: user.id,
            avatar_url: newAvatarUrl,
            additional_photos: photos,
          });
          
          if (newProfile) {
            setExistingProfile(newProfile);
          }
        } else {
          // Form is incomplete, but we'll still update the avatar
          // to save on our component state for when the form is submitted later
          toast.info("Avatar updated, but please complete your profile");
        }
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update profile picture in the database");
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    try {
      const profileData = {
        ...data,
        user_id: user.id,
        avatar_url: avatarUrl,
        additional_photos: photos,
      };
      
      if (existingProfile) {
        await updateProfile({
          ...profileData,
          id: existingProfile.id,
        });
        toast.success("Profile updated successfully");
      } else {
        await createProfile(profileData);
        toast.success("Profile created successfully");
      }
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass border-0 shadow-lg">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your university" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNIVERSITIES.map((uni) => (
                            <SelectItem key={uni} value={uni}>
                              {uni}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Major / Field of Study</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your major" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="graduation_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select graduation year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {graduationYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Male" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Male
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Female" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Female
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Non-binary" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Non-binary
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Prefer not to say" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Prefer not to say
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Profile Photos</h3>
                  <PhotoUpload
                    userId={user.id}
                    existingPhotos={photos}
                    onPhotosChange={setPhotos}
                    avatarUrl={avatarUrl}
                    onAvatarChange={handleAvatarChange}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a short bio about yourself"
                          className="resize-none"
                          {...field}
                          maxLength={300}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground text-right">
                        {field.value?.length || 0}/300
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interests</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={INTERESTS.map(interest => ({ label: interest, value: interest }))}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Select interests"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-ivy hover:bg-ivy-dark" 
                disabled={loading}
              >
                {loading ? "Saving..." : existingProfile ? "Update Profile" : "Create Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
