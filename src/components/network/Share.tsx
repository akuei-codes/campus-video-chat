
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Mail, Share as ShareIcon, Check } from "lucide-react";

interface ShareProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Share = ({ isOpen, onClose }: ShareProps) => {
  const [copied, setCopied] = useState(false);
  
  const shareLink = `${window.location.origin}/login?ref=${encodeURIComponent(
    "invite"
  )}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Invitation link copied to clipboard!");
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent("Join me on IvyLeague Connect!");
    const body = encodeURIComponent(
      `Hey there! I've been using this amazing platform to connect with other Ivy League students through video calls. Join me here: ${shareLink}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareToSocial = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on IvyLeague Connect!',
        text: 'Connect with other Ivy League students through video calls.',
        url: shareLink,
      })
      .then(() => toast.success('Shared successfully'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-center">Invite Your Friends</DialogTitle>
          <DialogDescription className="text-center">
            Share this link with your Ivy League friends to join the platform
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <Input
              readOnly
              value={shareLink}
              className="w-full animate-fade-in"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className={`px-3 hover-scale ${copied ? "bg-ivy text-white" : ""}`}
            onClick={copyToClipboard}
          >
            <span className="sr-only">Copy</span>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 animate-fade-in" style={{animationDelay: "0.2s"}}>
          <Button variant="outline" className="w-full" onClick={shareByEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Share via Email
          </Button>
          <Button variant="outline" className="w-full" onClick={shareToSocial}>
            <ShareIcon className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
        <DialogFooter className="sm:justify-center animate-fade-in" style={{animationDelay: "0.3s"}}>
          <Button
            className="mt-2 w-full bg-ivy hover:bg-ivy-dark sm:w-auto hover-scale"
            onClick={copyToClipboard}
          >
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
