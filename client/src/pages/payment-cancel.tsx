import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Calendar } from "lucide-react";

export default function PaymentCancel() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-orange-600 dark:text-orange-400" data-testid="icon-cancel" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-cancel-title">Payment Cancelled</CardTitle>
          <CardDescription data-testid="text-cancel-description">
            Your payment was cancelled. No charges have been made.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground" data-testid="text-cancel-message">
            You can try again or return to your dashboard. Your booking is still pending.
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => navigate("/")} variant="outline" className="gap-2" data-testid="button-back-dashboard">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
            <Button onClick={() => navigate("/events")} className="gap-2" data-testid="button-view-events">
              <Calendar className="w-4 h-4" /> View My Events
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
