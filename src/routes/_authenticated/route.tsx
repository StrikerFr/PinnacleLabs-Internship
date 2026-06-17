import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Auth has been removed; just return a mock local user
    return { user: { id: "local_user_1", email: "local@example.com" } };
  },
  component: () => <Outlet />,
});
