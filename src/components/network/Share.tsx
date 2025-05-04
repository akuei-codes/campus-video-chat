
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowDown } from "lucide-react";

interface ShareProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Share = ({ isOpen, onClose }: ShareProps) => {
  const [copied, setCopied] = useState(false);
  
  const appUrl = window.location.origin;
  const shareText = `Join me on IvyTV - Connect with Ivy League students through video chat! ${appUrl}`;
  
  const copyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };
  
  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join me on IvyTV!");
    const body = encodeURIComponent(`Hey,\n\nI've been using IvyTV to connect with other Ivy League students through video chat. You should join too!\n\n${appUrl}\n\nSee you there!`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends</DialogTitle>
          <DialogDescription>
            Share IvyTV with your Ivy League friends
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <div className="text-sm font-medium mb-2">Share this link</div>
            <div className="flex gap-2">
              <Input value={appUrl} readOnly className="flex-1" />
              <Button onClick={copyLink}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or share via</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button variant="outline" onClick={shareViaEmail} className="justify-start">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              Email
            </Button>
            
            {navigator.share && (
              <Button variant="outline" onClick={() => navigator.share({ title: "Join me on IvyTV", text: shareText, url: appUrl })} className="justify-start">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                </svg>
                Native Share
              </Button>
            )}
          </div>
          
          <div className="relative flex items-center justify-center mt-6">
            <ArrowDown className="h-6 w-6 text-muted-foreground animate-bounce" />
          </div>
          
          <div className="text-center">
            <h4 className="font-medium mb-2">How it works</h4>
            <p className="text-sm text-muted-foreground">
              Friends can only join if they have an official Ivy League email address.
              Our system verifies all emails before allowing access.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
