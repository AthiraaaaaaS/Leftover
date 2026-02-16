import { useNavigate } from "react-router-dom";
import { GradientHeader } from "@/components/gradient-header/GradientHeader";
import { Button } from "@/components/ui/button";
import { mockApi } from "@/mock/mockApi";

export default function Settings() {
  const nav = useNavigate();

  return (
    <div className="space-y-4">
      <GradientHeader title="Settings" subtitle="Account actions" />

      <div className="space-y-2">
        <Button
          variant="secondary"
          className="w-full rounded-xl"
          onClick={() => {
            mockApi.auth.logout();
            nav("/auth", { replace: true });
          }}
        >
          Logout
        </Button>

        <Button
          variant="destructive"
          className="w-full rounded-xl"
          onClick={() => {
            mockApi.resetDemo();
            nav("/", { replace: true });
          }}
        >
          Reset donations/tasks demo data
        </Button>

        <Button
          variant="destructive"
          className="w-full rounded-xl"
          onClick={() => {
            mockApi.resetDemo();
            mockApi.auth.resetAuthDemo();
            nav("/auth", { replace: true });
          }}
        >
          Reset EVERYTHING (auth + donations)
        </Button>
      </div>
    </div>
  );
}
