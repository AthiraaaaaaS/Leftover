import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { api } from "@/lib/api";

export default function DonorSignup() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");

  const [aadhaarLast4, setAadhaarLast4] = useState("");
  const [consent, setConsent] = useState(false);

  const [idFrontFile, setIdFrontFile] = useState<File | undefined>();
  const [idBackFile, setIdBackFile] = useState<File | undefined>();

  return (
    <div className="space-y-4">
      <GradientHeader
        title="Donor Registration"
        subtitle="Extra verification fields for donors (demo)"
      />

      <Card className="bg-card/60">
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-medium">Login credentials</div>
          <Input
            className="rounded-xl"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            className="rounded-xl"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="pt-2 text-sm font-medium">Donor details</div>
          <Input
            className="rounded-xl"
            placeholder="full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            className="rounded-xl"
            placeholder="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            className="rounded-xl"
            placeholder="organization (optional)"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />

          <div className="pt-2 text-sm font-medium">
            Verification (safer demo)
          </div>
          <Input
            className="rounded-xl"
            placeholder="Aadhaar last 4 digits (optional)"
            value={aadhaarLast4}
            onChange={(e) => setAadhaarLast4(e.target.value)}
            inputMode="numeric"
          />

          <div className="flex items-center gap-2 rounded-xl border bg-background/20 p-3">
            <Checkbox
              checked={consent}
              onCheckedChange={(v) => setConsent(!!v)}
            />
            <div className="text-sm">
              I consent to share ID details for verification
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                ID Front (upload)
              </div>
              <Input
                className="rounded-xl"
                type="file"
                accept="image/*"
                onChange={(e) => setIdFrontFile(e.target.files?.[0])}
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                ID Back (upload)
              </div>
              <Input
                className="rounded-xl"
                type="file"
                accept="image/*"
                onChange={(e) => setIdBackFile(e.target.files?.[0])}
              />
            </div>
          </div>

          {err ? <div className="text-sm text-destructive">{err}</div> : null}

          <Button
            className="w-full rounded-xl"
            disabled={busy}
            onClick={async () => {
              setErr(null);
              setBusy(true);
              try {
                await api.auth.registerDonor({
                  username,
                  password,
                  fullName,
                  phone,
                  organization: organization || undefined,
                  aadhaarLast4: aadhaarLast4 || undefined,
                  aadhaarConsent: consent,
                  idFrontFile,
                  idBackFile,
                });
                nav("/auth/login");
              } catch (e: any) {
                setErr(e?.message ?? "Signup failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Creating..." : "Create Donor Account"}
          </Button>

          <Button
            variant="secondary"
            className="w-full rounded-xl"
            onClick={() => nav("/auth")}
          >
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
