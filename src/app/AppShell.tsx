// src/app/AppShell.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PlusCircle,
  HandHeart,
  ClipboardList,
  Bell,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUserSync } from "@/lib/authClient";

type NavItem = { label: string; icon: React.ElementType; to: string };

function getRoleNav(): NavItem[] {
  const user = getCurrentUserSync();

  // fallback nav if something goes wrong
  if (!user) {
    return [
      { label: "Home", icon: Home, to: "/auth" },
      { label: "Alerts", icon: Bell, to: "/alerts" },
      { label: "Profile", icon: User, to: "/profile" },
      { label: "Home", icon: Home, to: "/auth" },
      { label: "Home", icon: Home, to: "/auth" },
    ];
  }

  if (user.role === "DONOR") {
    return [
      { label: "Home", icon: Home, to: "/donor/home" },
      { label: "Create", icon: PlusCircle, to: "/donor/create" },
      { label: "Donations", icon: ClipboardList, to: "/donor/donations" },
      { label: "Alerts", icon: Bell, to: "/alerts" },
      { label: "Profile", icon: User, to: "/profile" },
    ];
  }

  return [
    { label: "Home", icon: Home, to: "/volunteer/home" },
    { label: "Pickups", icon: HandHeart, to: "/volunteer/pickups" },
    { label: "Tasks", icon: ClipboardList, to: "/volunteer/tasks" },
    { label: "Alerts", icon: Bell, to: "/alerts" },
    { label: "Profile", icon: User, to: "/profile" },
  ];
}

export default function AppShell() {
  const nav = getRoleNav();
  const loc = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-md px-4 pb-24 pt-4">
        <Outlet />
      </div>

      <div className="fixed inset-x-0 bottom-0">
        <div className="mx-auto max-w-md px-4 pb-4">
          <div className="rounded-2xl border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 p-2 shadow-lg shadow-black/30">
            <div className="grid grid-cols-5 gap-1">
              {nav.map((item) => {
                const active = loc.pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Button
                    key={item.to}
                    variant={active ? "secondary" : "ghost"}
                    className={cn(
                      "h-12 flex flex-col gap-1",
                      active && "border"
                    )}
                    onClick={() => navigate(item.to)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[11px] leading-none">
                      {item.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
