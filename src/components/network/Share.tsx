
import React from "react";
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
import { Copy, Mail } from "lucide-react";

interface ShareProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Share = ({ isOpen, onClose }: ShareProps) => {
  const shareLink = `${window.location.origin}/login?ref=${encodeURIComponent(
    "invite"
  )}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Invitation link copied to clipboard!");
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent("Join me on IvyLeague Connect!");
    const body = encodeURIComponent(
      `Hey there! I've been using this amazing platform to connect with other Ivy League students through video calls. Join me here: ${shareLink}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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
              className="w-full"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="px-3"
            onClick={copyToClipboard}
          >
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" className="mt-2 w-full sm:w-auto" onClick={shareByEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Share via Email
          </Button>
          <Button
            className="mt-2 w-full bg-ivy hover:bg-ivy-dark sm:w-auto"
            onClick={copyToClipboard}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
