
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginDialog = ({ isOpen, onClose, onSuccess }: LoginDialogProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // Close the dialog and redirect to auth page
      onClose();
      navigate("/auth");
    }
  }, [isOpen, onClose, navigate]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            Please sign in to access this feature.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center">
          <Button
            onClick={() => navigate("/auth")}
            className="bg-insurance-blue hover:bg-insurance-blue-dark"
          >
            Go to Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
