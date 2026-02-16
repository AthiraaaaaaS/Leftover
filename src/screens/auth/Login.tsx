// src/screens/auth/Login.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { mockApi } from "@/mock/mockApi";
import { getHomePathFor } from "@/lib/authClient";
import { Eye, EyeOff, Lock, User2, RotateCcw } from "lucide-react";

const REMEMBER_KEY = "leftoverlink_remember_username_v1";

export default function Login() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) setUsername(saved);
  }, []);

  const canLogin = useMemo(
    () => username.trim().length >= 3 && password.length >= 4,
    [username, password]
  );

  return (
    <div className="min-h-dvh flex flex-col px-4 ">
      {/* top */}
      <div className="pt-4">
        <GradientHeader title="Leftover Link" subtitle="Login to continue" />
      </div>

      {/* center */}
      <div className="flex-1 flex items-center">
        <Card className="py-0 w-full bg-card/60 border shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <div className="text-xl font-semibold">Welcome back</div>
              <div className="text-sm text-muted-foreground">
                Enter your username and password to access your dashboard.
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Username</div>
              <div className="relative">
                <User2 className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="rounded-xl pl-9 h-12"
                  placeholder="e.g., donor_anu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Password</div>
              <div className="relative">
                <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  className="rounded-xl pl-9 pr-10 h-12"
                  placeholder="min 4 characters"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(!!v)}
                />
                <div className="text-sm text-muted-foreground">
                  Remember username
                </div>
              </div>

              <button
                type="button"
                className="text-sm text-muted-foreground hover:underline"
                onClick={() => {
                  // demo only
                  alert("Forgot password flow will be added later.");
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* error */}
            {err ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {err}
              </div>
            ) : null}

            {/* actions */}
            <Button
              className="w-full rounded-xl h-12"
              disabled={!canLogin || busy}
              onClick={async () => {
                setErr(null);
                setBusy(true);
                try {
                  if (remember)
                    localStorage.setItem(REMEMBER_KEY, username.trim());
                  else localStorage.removeItem(REMEMBER_KEY);

                  const { user } = await mockApi.auth.login({
                    username,
                    password,
                  });
                  nav(getHomePathFor(user), { replace: true });
                } catch (e: any) {
                  setErr(e?.message ?? "Login failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Logging in..." : "Login"}
            </Button>

            <Button
              variant="secondary"
              className="w-full rounded-xl h-12"
              onClick={() => nav("/auth/signup")}
            >
              Create account (Sign up)
            </Button>

            <div className="pt-1">
              <Button
                variant="ghost"
                className="w-full rounded-xl text-muted-foreground"
                onClick={() => {
                  mockApi.resetDemo();
                  mockApi.auth.resetAuthDemo();
                  window.location.href = "/auth/login";
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset demo data
              </Button>
            </div>

            {/* hint */}
            <div className="text-center text-xs text-muted-foreground">
              Demo auth is stored locally (localStorage)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* bottom */}
      <div className="pb-4 text-center text-xs text-muted-foreground">
        Leftover Link • PWA Demo
      </div>
    </div>
  );
}
