import { useNavigate } from "@tanstack/react-router";

export const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      navigate({ to: "/logout" });
    } catch (error) {
      console.error("Zitadel logout failed:", error);
      // Handle logout error
    }
  };

  return {
    handleLogout,
  };
};