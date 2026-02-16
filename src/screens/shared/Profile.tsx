import { useNavigate } from "react-router-dom";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUserSync } from "@/lib/authClient";

export default function Profile() {
  const nav = useNavigate();
  const user = getCurrentUserSync();

  if (!user) {
    return (
      <div className="space-y-4">
        <GradientHeader title="Profile" subtitle="Not logged in" />
        <Button className="rounded-xl" onClick={() => nav("/auth")}>
          Go to Auth
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GradientHeader
        title="Profile"
        subtitle={`${user.role} • @${user.username}`}
      />

      <Card className="bg-card/60">
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-medium">Account</div>
          <div className="text-sm text-muted-foreground">
            Created: {new Date(user.createdAt).toLocaleString()}
          </div>

          {user.role === "DONOR" ? (
            <>
              <div className="pt-2 text-sm font-medium">Donor details</div>
              <div className="text-sm">{user.donor.fullName}</div>
              <div className="text-sm text-muted-foreground">
                {user.donor.phone}
              </div>
              {user.donor.organization ? (
                <div className="text-sm text-muted-foreground">
                  {user.donor.organization}
                </div>
              ) : null}

              <div className="pt-2 text-sm font-medium">
                Verification (demo)
              </div>
              <div className="text-sm text-muted-foreground">
                Aadhaar last4:{" "}
                {user.donor.aadhaarLast4 ? user.donor.aadhaarLast4 : "—"}
              </div>
              <div className="text-sm text-muted-foreground">
                Consent: {user.donor.aadhaarConsent ? "Yes" : "No"}
              </div>

              {user.donor.idFrontImage || user.donor.idBackImage ? (
                <div className="pt-2 grid grid-cols-2 gap-2">
                  {user.donor.idFrontImage ? (
                    <img
                      className="rounded-xl border object-cover h-28 w-full"
                      src={user.donor.idFrontImage}
                      alt="ID front"
                    />
                  ) : null}
                  {user.donor.idBackImage ? (
                    <img
                      className="rounded-xl border object-cover h-28 w-full"
                      src={user.donor.idBackImage}
                      alt="ID back"
                    />
                  ) : null}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="pt-2 text-sm font-medium">Volunteer details</div>
              <div className="text-sm">{user.volunteer.fullName}</div>
              <div className="text-sm text-muted-foreground">
                {user.volunteer.phone}
              </div>
              {user.volunteer.city ? (
                <div className="text-sm text-muted-foreground">
                  {user.volunteer.city}
                </div>
              ) : null}
              <div className="text-sm text-muted-foreground">
                Vehicle: {user.volunteer.hasVehicle ? "Yes" : "No"}
              </div>
            </>
          )}

          <Button
            variant="secondary"
            className="w-full rounded-xl"
            onClick={() => nav("/settings")}
          >
            Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
