"use client";

import { auth, provider } from "@commons/utils/firebase-config.utils";
import { getUserInfoAction, resetSigninState, signinAction, signinSelector } from "@stores/reducers/auth";

import {
  browserLocalPersistence,
  getRedirectResult,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";

import { Button } from "@components/ui/button";
import { LOADING_STATUS } from "@constants/status";
import { useAppDispatch, useAppSelector } from "@stores/index";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const GoogleIcon = () => (
  <svg className="size-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

/* ------------------------------
 * Detect WebView
 * ------------------------------ */
const isWebview = (() => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    /fbav|fbios|fb_iab|instagram|line/i.test(ua) || /(iphone|ipad|ipod).*applewebkit(?!.*safari)/i.test(ua) // iOS in-app browser
  );
})();

/* ------------------------------
 * Detect Old Safari
 * ------------------------------ */
const isOldSafari = (() => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const version = ua.match(/Version\/(\d+)/)?.[1];
  return /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua) && Number(version) < 17;
})();

const mustRedirect = isWebview || isOldSafari;

export default function LoginWithGoogle({ handleAuthPopup }: { handleAuthPopup?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const dispatch = useAppDispatch();
  const signin = useAppSelector(signinSelector);

  const [isLoadingRedirect, setIsLoadingRedirect] = useState(false);

  useEffect(() => {
    if (signin.status === LOADING_STATUS.SUCCESS) {
      window.location.reload();
    }
  }, [signin.status]);

  /* ------------------------------
   * Popup → Redirect fallback
   * ------------------------------ */
  const redirectLogin = async () => {
    if (!auth || !provider) return;
    setIsLoadingRedirect(true);
    localStorage.setItem("google_redirect_pending", "1");
    await setPersistence(auth, browserLocalPersistence);
    return signInWithRedirect(auth, provider);
  };

  /* ------------------------------
   * Login main function
   * ------------------------------ */
  const loginWithGoogle = async () => {
    try {
      if (!auth || !provider) return;

      // Safari / WebView → redirect ngay
      if (mustRedirect) {
        return redirectLogin();
      }

      // Popup mode
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      dispatch(
        signinAction({
          token: idToken,
          provider: "google",
        })
      );
    } catch (err: any) {
      console.error("Google login error:", err);

      const popupErrors = ["auth/popup-blocked", "auth/popup-closed-by-user", "popup", "blocked"];

      if (popupErrors.some((e) => err?.message?.includes(e) || err?.code === e)) {
        toast.warning("Safari popup blocked");
        return redirectLogin();
      }

      toast.error("Google login failed");
    }
  };

  /* ------------------------------
   * Handle redirect result
   * ------------------------------ */
  useEffect(() => {
    const handleRedirectLogin = async () => {
      if (!auth) return;

      const pending = localStorage.getItem("google_redirect_pending");
      if (!pending) return;

      setIsLoadingRedirect(true);

      try {
        const result = await getRedirectResult(auth);
        localStorage.removeItem("google_redirect_pending");

        if (result?.user) {
          const idToken = await result.user.getIdToken();
          dispatch(
            signinAction({
              token: idToken,
              provider: "google",
            })
          );
        }
      } catch (err) {
        console.error("Redirect login error:", err);
        localStorage.removeItem("google_redirect_pending");
      } finally {
        setIsLoadingRedirect(false);
      }
    };

    handleRedirectLogin();
  }, []);

  /* ------------------------------
   * Watch signin status
   * ------------------------------ */
  useEffect(() => {
    if (signin.status === LOADING_STATUS.SUCCESS && (signin.data as any)?.provider) {
      toast.success("Signed in successfully");

      dispatch(getUserInfoAction());
      dispatch(resetSigninState());

      if (handleAuthPopup) handleAuthPopup();
      else router.replace(redirectUrl);
    }

    if (signin.status === LOADING_STATUS.ERROR && (signin.params as any)?.provider) {
      toast.error("Signed in failed");
      dispatch(resetSigninState());
    }
  }, [signin.status]);

  return (
    <>
      <Button onClick={loginWithGoogle} variant="outline" className="h-12">
        <span className="mr-2">
          <GoogleIcon />
        </span>
        Google
      </Button>
      {/* Loading Overlay */}
      {isLoadingRedirect && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              border: "6px solid #ccc",
              borderTopColor: "#4285F4",
              borderRadius: "50%",
              animation: "spinner 0.8s linear infinite",
            }}
          />
          <style>{`
            @keyframes spinner {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
