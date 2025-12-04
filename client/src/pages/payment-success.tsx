import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, ArrowRight, AlertCircle } from "lucide-react";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQueryParams = () => {
    if (typeof window === 'undefined') return { sessionId: null };
    const params = new URLSearchParams(window.location.search);
    return {
      sessionId: params.get("session_id"),
    };
  };

  const { sessionId } = getQueryParams();

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/checkout/verify", {
        sessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setVerified(true);
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
        queryClient.invalidateQueries({ queryKey: ["/api/events"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/payments"] });
      } else {
        setError(`Payment verification failed: ${data.paymentStatus || 'Unknown status'}`);
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to verify payment. Please contact support.");
    },
  });

  useEffect(() => {
    if (sessionId && !verified && !error && !verifyMutation.isPending) {
      verifyMutation.mutate();
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-10">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2" data-testid="text-error-title">Invalid Payment Link</h2>
            <p className="text-muted-foreground mb-6" data-testid="text-error-message">
              This payment link is missing required information. Please try again from your dashboard.
            </p>
            <Button onClick={() => navigate("/dashboard")} data-testid="button-return-dashboard">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-10">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" data-testid="icon-loading" />
            <h2 className="text-xl font-semibold mb-2" data-testid="text-verifying">Verifying Payment...</h2>
            <p className="text-muted-foreground" data-testid="text-verifying-message">
              Please wait while we confirm your payment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-10">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2" data-testid="text-error-title">Payment Error</h2>
            <p className="text-muted-foreground mb-6" data-testid="text-error-message">{error}</p>
            <Button onClick={() => navigate("/")} data-testid="button-return-dashboard">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" data-testid="icon-success" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-success-title">Payment Successful!</CardTitle>
          <CardDescription data-testid="text-success-description">
            Your booking has been confirmed and the vendor has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground" data-testid="text-thank-you">
            Thank you for your payment. You can view your booking details in your dashboard.
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => navigate("/")} className="gap-2" data-testid="button-go-dashboard">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/events")} data-testid="button-view-events">
              View My Events
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
