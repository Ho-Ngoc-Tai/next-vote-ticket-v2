import { logoutAction, userLogoutSelector } from "@stores/reducers/auth";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@stores/index";
import { LOADING_STATUS } from "@constants/status";
import { toast } from "sonner";

export function useLogout() {
  const { status: logoutStatus } = useAppSelector(userLogoutSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (logoutStatus === LOADING_STATUS.SUCCESS) {
      toast.success("Logged out successfully");
      window.location.reload();
    }
    if (logoutStatus === LOADING_STATUS.ERROR) {
      toast.error("Logout failed");
    }
  }, [logoutStatus]);

  const logout = () => {
    dispatch(logoutAction());
  };

  return { logout };
}
