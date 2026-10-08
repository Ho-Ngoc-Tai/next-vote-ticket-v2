"use client";
import { Spinner } from "@components/ui/spinner";
import { LOADING_STATUS } from "@constants/status";
import { useAppDispatch, useAppSelector } from "@stores/index";
import { getUserInfoAction, userInfoSelector } from "@stores/reducers/auth";
import { useEffect } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { status: userInfoStatus } = useAppSelector(userInfoSelector);

  useEffect(() => {
    dispatch(getUserInfoAction());
  }, []);

  return (
    <>
      {(userInfoStatus === LOADING_STATUS.LOADING || userInfoStatus === LOADING_STATUS.IDLE) && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Spinner className="size-10 animate-spin text-primary" />
        </div>
      )}
      {children}
    </>
  );
};

export default AuthProvider;
