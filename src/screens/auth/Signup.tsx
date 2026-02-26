// src/screens/auth/Signup.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { mockApi } from "@/mock/mockApi";
import { getHomePathFor } from "@/lib/authClient";
import { HandHeart, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

type Role = "DONOR" | "VOLUNTEER";
type Step = "ROLE" | "FORM";

const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

function RoleTile({
  title,
  subtitle,
  icon: Icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: any;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border bg-card/60 hover:bg-card/70 transition-colors p-4 text-left"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border bg-background/40 p-2">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
        </div>
      </div>
    </button>
  );
}

export default function Signup() {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("ROLE");
  const [role, setRole] = useState<Role | null>(null);

  // credentials
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // shared
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // donor-only
  const [organization, setOrganization] = useState("");
  const [aadhaarLast4, setAadhaarLast4] = useState("");
  const [consent, setConsent] = useState(false);
  const [idFrontFile, setIdFrontFile] = useState<File | undefined>();
  const [idBackFile, setIdBackFile] = useState<File | undefined>();

  // volunteer-only
  const [city, setCity] = useState("");
  const [hasVehicle, setHasVehicle] = useState(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const credentialsOk = useMemo(() => {
    return username.trim().length >= 3 && password.length >= 4;
  }, [username, password]);

  const commonOk = useMemo(() => {
    return fullName.trim().length >= 2 && phone.trim().length >= 6;
  }, [fullName, phone]);

  const donorOk = useMemo(() => {
    // require consent for donor
    return credentialsOk && commonOk && consent;
  }, [credentialsOk, commonOk, consent]);

  const volunteerOk = useMemo(() => {
    return credentialsOk && commonOk;
  }, [credentialsOk, commonOk]);

  return (
    <div className="min-h-dvh flex flex-col px-4">
      <div className="pt-4">
        <GradientHeader
          title="Sign up"
          subtitle={
            step === "ROLE"
              ? "Choose your role"
              : role === "DONOR"
                ? "Donor registration"
                : "Volunteer registration"
          }
        />
      </div>

      <div className="flex-1 flex items-center mt-4">
        <Card className="w-full bg-card/60 py-0">
          <CardContent className="p-4 space-y-3">
            {step === "ROLE" ? (
              <>
                <RoleTile
                  title="Donor"
                  subtitle="Post surplus food, add pickup location"
                  icon={UtensilsCrossed}
                  onClick={() => {
                    setRole("DONOR");
                    setStep("FORM");
                  }}
                />
                <RoleTile
                  title="Volunteer"
                  subtitle="Accept pickups, complete delivery checklist"
                  icon={HandHeart}
                  onClick={() => {
                    setRole("VOLUNTEER");
                    setStep("FORM");
                  }}
                />

                <Button
                  variant="secondary"
                  className="w-full rounded-xl h-12"
                  onClick={() => nav("/auth/login")}
                >
                  Back to Login
                </Button>
              </>
            ) : (
              <>
                {/* Back to role */}
                <Button
                  variant="ghost"
                  className="w-full rounded-xl justify-start text-muted-foreground"
                  onClick={() => {
                    setErr(null);
                    setStep("ROLE");
                    setRole(null);
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Change role
                </Button>

                {/* Credentials */}
                <div className="text-sm font-medium pt-1">
                  Login credentials
                </div>
                <Input
                  className="rounded-xl"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  className="rounded-xl"
                  placeholder="password (min 4 chars)"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Common */}
                <div className="text-sm font-medium pt-2">Basic details</div>
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

                {/* Role-specific */}
                {role === "DONOR" ? (
                  <>
                    <div className="text-sm font-medium pt-2">
                      Donor details
                    </div>
                    <Input
                      className="rounded-xl"
                      placeholder="organization (optional)"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />

                    <div className="text-sm font-medium pt-2">
                      Verification (demo)
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
                          ID Front (image)
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
                          ID Back (image)
                        </div>
                        <Input
                          className="rounded-xl"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setIdBackFile(e.target.files?.[0])}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium pt-2">
                      Volunteer details
                    </div>
                    <Input
                      className="rounded-xl"
                      placeholder="city (optional)"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />

                    <div className="flex items-center gap-2 rounded-xl border bg-background/20 p-3">
                      <Checkbox
                        checked={hasVehicle}
                        onCheckedChange={(v) => setHasVehicle(!!v)}
                      />
                      <div className="text-sm">I have a vehicle (bike/car)</div>
                    </div>
                  </>
                )}

                {err ? (
                  <div className="text-sm text-destructive">{err}</div>
                ) : null}
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setToken(token)}
                  onError={() => setToken(null)}
                  onExpire={() => setToken(null)}
                />
                <Button
                  className="w-full rounded-xl h-12"
                  disabled={
                    busy ||
                    !role ||
                    (role === "DONOR" ? !donorOk : !volunteerOk) ||
                    !token
                  }
                  onClick={async () => {
                    if (!role) return;
                    setErr(null);
                    setBusy(true);
                    try {
                      if (role === "DONOR") {
                        await mockApi.auth.registerDonor({
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
                      } else {
                        await mockApi.auth.registerVolunteer({
                          username,
                          password,
                          fullName,
                          phone,
                          city: city || undefined,
                          hasVehicle,
                        });
                      }

                      // auto-login after signup
                      const { user } = await mockApi.auth.login({
                        username,
                        password,
                      });
                      nav(getHomePathFor(user), { replace: true });
                    } catch (e: any) {
                      setErr(e?.message ?? "Signup failed");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {busy ? "Creating account..." : "Create account"}
                </Button>

                <Button
                  variant="secondary"
                  className="w-full rounded-xl h-12"
                  onClick={() => nav("/auth/login")}
                >
                  Back to Login
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-2 pb-4 text-center text-xs text-muted-foreground">
        Role-based registration • Demo auth (localStorage)
      </div>
    </div>
  );
}
