import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import FancyBackground from "@/components/FancyBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type LocalChecklistState = Record<string, boolean>;

const CHECKLIST_ITEMS = [
  {
    id: "policy_schedule",
    title: "Keep policy schedule handy",
    hint: "Policy number, insurer name, and coverage dates.",
  },
  {
    id: "endorsements",
    title: "Save all endorsements & add-ons",
    hint: "Many claims fail due to missing add-on proof.",
  },
  {
    id: "claims_contacts",
    title: "Store claim contact numbers",
    hint: "Emergency line + broker/agent contact.",
  },
  {
    id: "photos_inventory",
    title: "Maintain photo/inventory proof",
    hint: "Photos + receipts for high-value items.",
  },
  {
    id: "deductible",
    title: "Know your deductible & waiting periods",
    hint: "Avoid surprise out-of-pocket costs.",
  },
] as const;

function loadChecklist(): LocalChecklistState {
  try {
    const raw = localStorage.getItem("claims_readiness_checklist");
    return raw ? (JSON.parse(raw) as LocalChecklistState) : {};
  } catch {
    return {};
  }
}

function saveChecklist(state: LocalChecklistState) {
  try {
    localStorage.setItem("claims_readiness_checklist", JSON.stringify(state));
  } catch {
    // ignore
  }
}

const ValueHub = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Renewal / price-check reminders
  const [policyName, setPolicyName] = useState("");
  const [email, setEmail] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [note, setNote] = useState("");
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  // Claims readiness checklist
  const [checklist, setChecklist] = useState<LocalChecklistState>({});

  // Insurer reputation insights (user-supplied today; data-feed later)
  const [settlementRatio, setSettlementRatio] = useState<number>(85);
  const [complaintTrend, setComplaintTrend] = useState<number>(0);
  const [addonValue, setAddonValue] = useState<number>(70);

  useEffect(() => {
    setChecklist(loadChecklist());
  }, []);

  useEffect(() => {
    saveChecklist(checklist);
  }, [checklist]);

  const reputationScore = useMemo(() => {
    // Simple transparent scoring (0-100):
    // - settlement ratio matters most
    // - complaint trend is a penalty (negative = improving, positive = worsening)
    // - add-on value measures perceived add-on usefulness vs price
    const settlement = Math.max(0, Math.min(100, settlementRatio));
    const addon = Math.max(0, Math.min(100, addonValue));
    const complaintPenalty = Math.max(-30, Math.min(30, complaintTrend)) * 1.2; // -36..36
    const raw = 0.55 * settlement + 0.35 * addon - 0.1 * complaintPenalty;
    return Math.round(Math.max(0, Math.min(100, raw)));
  }, [addonValue, complaintTrend, settlementRatio]);

  const handleSaveReminder = async () => {
    if (!policyName.trim() || !email.trim() || !renewalDate) {
      toast({
        title: "Missing details",
        description: "Please enter policy name, email, and renewal date.",
        variant: "destructive",
      });
      return;
    }

    // Hybrid: store locally for everyone, and in DB for signed-in users.
    const localEntry = { policyName, email, renewalDate, note, createdAt: new Date().toISOString() };
    try {
      const raw = localStorage.getItem("renewal_reminders_local");
      const arr = raw ? (JSON.parse(raw) as any[]) : [];
      arr.unshift(localEntry);
      localStorage.setItem("renewal_reminders_local", JSON.stringify(arr.slice(0, 20)));
    } catch {
      // ignore
    }

    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Saved on this device",
        description: "Sign in to sync reminders across devices.",
      });
      setPolicyName("");
      setEmail("");
      setRenewalDate("");
      setNote("");
      return;
    }

    setIsSavingReminder(true);
    const { error } = await supabase.from("renewal_reminders").insert({
      user_id: user.id,
      email,
      policy_name: policyName,
      renewal_date: renewalDate,
      note: note || null,
    });
    setIsSavingReminder(false);

    if (error) {
      toast({
        title: "Could not save to account",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reminder saved",
      description: "We’ll use this later to power renewal + price-check alerts.",
    });
    setPolicyName("");
    setEmail("");
    setRenewalDate("");
    setNote("");
  };

  return (
    <FancyBackground>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="container mx-auto py-10 px-4 flex-1">
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-insurance-blue-dark">Value+ Tools</h1>
              <p className="text-insurance-gray max-w-3xl">
                Practical tools that keep policyholders coming back: renewal reminders, claims readiness, a
                transparent policy health score (coming next), and insurer reputation insights.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Renewal reminders */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle>Renewal / Price-check reminders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="policyName">Policy name</Label>
                      <Input
                        id="policyName"
                        value={policyName}
                        onChange={(e) => setPolicyName(e.target.value)}
                        placeholder="e.g., Health Policy - Family"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        type="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="renewalDate">Renewal date</Label>
                      <Input
                        id="renewalDate"
                        value={renewalDate}
                        onChange={(e) => setRenewalDate(e.target.value)}
                        type="date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">Note (optional)</Label>
                      <Input
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g., compare deductibles"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveReminder} disabled={isSavingReminder}>
                    {isSavingReminder ? "Saving…" : "Save reminder"}
                  </Button>
                  <p className="text-sm text-gray-600">
                    {isAuthenticated
                      ? "Saved to your account (and this device)."
                      : "Saved to this device. Sign in to sync across devices."}
                  </p>
                </CardContent>
              </Card>

              {/* Claims readiness checklist */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle>Claims readiness checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Tick these once and keep returning before any claim—this reduces delays and rejections.
                  </p>

                  <div className="space-y-3">
                    {CHECKLIST_ITEMS.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 rounded-md border p-3 bg-white">
                        <Checkbox
                          id={item.id}
                          checked={!!checklist[item.id]}
                          onCheckedChange={(checked) =>
                            setChecklist((prev) => ({ ...prev, [item.id]: Boolean(checked) }))
                          }
                        />
                        <div className="space-y-1">
                          <Label htmlFor={item.id} className="font-medium">
                            {item.title}
                          </Label>
                          <p className="text-xs text-gray-600">{item.hint}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />
                  <p className="text-xs text-gray-500">
                    Saved locally in your browser (hybrid roadmap: sync to account + attach to each policy).
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Policy score + benchmarking */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle>Policy score + benchmarking (next)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Next we’ll generate a repeatable “Policy Health Score” and benchmark it vs typical market
                    coverage for your profile.
                  </p>
                  <Button asChild variant="outline" className="border-insurance-blue text-insurance-blue">
                    <a href="/">Run analysis on your policy</a>
                  </Button>
                  <p className="text-xs text-gray-500">
                    This will connect to your uploaded policy analysis so scores update automatically.
                  </p>
                </CardContent>
              </Card>

              {/* Insurer reputation insights */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle>Side-by-side insurer reputation insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Enter publicly available numbers (or broker-supplied data). We’ll compute a transparent
                    reputation score.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="csr">Claim settlement ratio (%)</Label>
                      <Input
                        id="csr"
                        type="number"
                        min={0}
                        max={100}
                        value={settlementRatio}
                        onChange={(e) => setSettlementRatio(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complaints">Complaint trend (-30..30)</Label>
                      <Input
                        id="complaints"
                        type="number"
                        min={-30}
                        max={30}
                        value={complaintTrend}
                        onChange={(e) => setComplaintTrend(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addon">Add-on value (0..100)</Label>
                      <Input
                        id="addon"
                        type="number"
                        min={0}
                        max={100}
                        value={addonValue}
                        onChange={(e) => setAddonValue(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border bg-white p-4">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm text-gray-600">Reputation score</p>
                      <p className="text-2xl font-bold text-insurance-blue-dark">{reputationScore}/100</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Weighted: settlement ratio (55%), add-on value (35%), complaint trend penalty (10%).
                    </p>
                  </div>

                  <p className="text-xs text-gray-500">
                    Roadmap: auto-fetch settlement/complaint metrics by insurer + region and show true
                    side-by-side comparisons.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <FooterSection />
      </div>
    </FancyBackground>
  );
};

export default ValueHub;
