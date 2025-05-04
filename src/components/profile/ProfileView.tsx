
import React from "react";
import { Profile } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Mail, School, Calendar, User } from "lucide-react";

interface ProfileViewProps {
  profile: Profile;
  onEdit: () => void;
}

const ProfileView = ({ profile, onEdit }: ProfileViewProps) => {
  return (
    <Card className="glass border-0 shadow-lg overflow-hidden animate-fade-in">
      <CardHeader className="relative p-0">
        <div className="w-full h-32 bg-ivy/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-ivy/20 to-transparent"></div>
        </div>
        <div className="absolute -bottom-12 left-8">
          <div className="relative h-24 w-24 rounded-full border-4 border-white overflow-hidden">
            <img 
              src={profile.avatar_url || "/placeholder.svg"} 
              alt={profile.full_name} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-16 pb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
            <p className="text-muted-foreground flex items-center mt-1">
              <School className="h-4 w-4 mr-2 text-ivy" />
              {profile.university}, Class of {profile.graduation_year}
            </p>
          </div>
          <Button 
            onClick={onEdit} 
            variant="outline" 
            size="sm"
            className="hover-scale"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">About</h3>
              <p className="text-sm">{profile.bio || "No bio provided."}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Education</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <School className="h-4 w-4 mr-2 mt-0.5 text-ivy" />
                  <div>
                    <p className="font-medium">{profile.university}</p>
                    <p className="text-sm text-muted-foreground">{profile.major}</p>
                    <p className="text-sm text-muted-foreground">Class of {profile.graduation_year}</p>
                  </div>
                </div>
              </div>
            </div>

            {profile.gender && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Personal Info</h3>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-ivy" />
                  <span className="text-sm">{profile.gender}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.interests.map((interest, i) => (
                    <Badge key={i} variant="outline" className="bg-ivy/5 hover-scale">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.additional_photos && profile.additional_photos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Photos</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {profile.additional_photos.map((photo, i) => (
                    <div 
                      key={i} 
                      className="aspect-square rounded-md overflow-hidden hover-scale shadow-sm border border-gray-100"
                    >
                      <img 
                        src={photo} 
                        alt={`${profile.full_name}'s photo ${i + 1}`} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileView;
