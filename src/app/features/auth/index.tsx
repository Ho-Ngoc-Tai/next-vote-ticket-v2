"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Separator } from "@components/ui/separator";
import { signinSelector, signinAction, resetSigninState, getUserInfoAction } from "@stores/reducers/auth";
import { useAppDispatch, useAppSelector } from "@stores/index";
import { LOADING_STATUS } from "@constants/status";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoginWithGoogle from "./LoginWithGoogle";

const Signin = () => {
  // provider
  const dispatch = useAppDispatch();
  const { status: signinStatus } = useAppSelector(signinSelector);
  const router = useRouter();

  // state
  const [showPassword, setShowPassword] = useState(false);
  const [loginInfo, setLoginInfo] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (signinStatus === LOADING_STATUS.SUCCESS) {
      toast.success("Sign in successfully");
      dispatch(getUserInfoAction());
      const t = setTimeout(() => {
        dispatch(resetSigninState());
        router.push("/");
      }, 800);
      return () => clearTimeout(t);
    }
    if (signinStatus === LOADING_STATUS.ERROR) {
      toast.error("Email or password is incorrect");
      dispatch(resetSigninState());
    }
  }, [signinStatus]);

  const handleLogin = async (data: any) => {
    if (!data.username || !data.password) {
      toast.error("Please enter your email and password");
      return;
    }
    if (signinStatus === LOADING_STATUS.LOADING) return;

    const payload = {
      username: data.username,
      password: data.password,
    };

    dispatch(signinAction(payload));
  };

  return (
    <div className="mx-auto w-full max-w-[400px] px-6 lg:px-0 space-y-8">
      {/* Title */}
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>

      <div className="space-y-6">
        {/* Social buttons */}
        <div className="grid grid-cols-1">
          <LoginWithGoogle />
        </div>

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <span className="relative mx-auto flex w-fit bg-background px-4 text-xs uppercase text-muted-foreground">
            or continue with email
          </span>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-muted/30 border-muted-foreground/20 transition-colors focus:bg-background"
              value={loginInfo.username}
              onChange={(e) => setLoginInfo({ ...loginInfo, username: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button type="button" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-12 bg-muted/30 border-muted-foreground/20 pr-10 transition-colors focus:bg-background"
                value={loginInfo.password}
                onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
              </button>
            </div>
          </div>

          <Button
            onClick={(e) => {
              e.preventDefault();
              handleLogin(loginInfo);
            }}
            disabled={signinStatus === LOADING_STATUS.LOADING}
            className="h-12 w-full bg-linear-to-r from-violet-600 to-fuchsia-600 font-medium text-white transition-all hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-lg hover:shadow-violet-500/25"
          >
            {signinStatus === LOADING_STATUS.LOADING ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Signin;
