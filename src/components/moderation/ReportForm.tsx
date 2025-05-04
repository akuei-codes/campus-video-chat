
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { submitReport } from "@/lib/supabase";
import { toast } from "sonner";

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  reporterId: string;
  reportedUserId: string;
  roomId?: string;
}

const reportReasons = [
  { id: "inappropriate", label: "Inappropriate Content or Behavior" },
  { id: "harassment", label: "Harassment or Bullying" },
  { id: "not_ivy", label: "Not an Ivy League Student" },
  { id: "impersonation", label: "Impersonation" },
  { id: "other", label: "Other Issue" },
];

const ReportForm = ({
  isOpen,
  onClose,
  reporterId,
  reportedUserId,
  roomId,
}: ReportFormProps) => {
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason for your report");
      return;
    }
    
    try {
      setSubmitting(true);
      
      await submitReport({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reason,
        details: details || undefined,
        room_id: roomId,
      });
      
      toast.success("Report submitted successfully");
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass border-0 shadow-lg">
        <DialogHeader>
          <DialogTitle>Report User</DialogTitle>
          <DialogDescription>
            Submit a report about inappropriate behavior or other concerns
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Report</Label>
            <RadioGroup 
              id="reason" 
              value={reason} 
              onValueChange={setReason}
              className="space-y-2"
            >
              {reportReasons.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center space-x-2 rounded-md border p-3"
                >
                  <RadioGroupItem value={item.id} id={item.id} />
                  <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details (Optional)</Label>
            <Textarea
              id="details"
              placeholder="Please provide any additional information that may help us investigate"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason || submitting}
            className="bg-ivy hover:bg-ivy-dark"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;
