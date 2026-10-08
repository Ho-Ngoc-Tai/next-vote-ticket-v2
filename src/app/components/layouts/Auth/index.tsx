import Image from "next/image";
import Link from "next/link";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-black text-slate-100">
      <div className="mx-auto flex min-h-screen flex-col items-stretch justify-center lg:flex-row">
        {/* Left gradient / marketing panel */}
        <div className="relative hidden overflow-hidden bg-zinc-950 lg:flex lg:w-1/2">
          <div className="absolute inset-0 bg-linear-to-br from-violet-600/20 via-transparent to-cyan-600/20" />
          <div className="absolute inset-0 bg-linear-to-tr from-fuchsia-600/10 via-transparent to-amber-600/10 animate-pulse" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />

          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 opacity-20 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 opacity-20 blur-3xl animate-[pulse_5s_ease-in-out_infinite_1s]" />
          <div className="absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-linear-to-r from-amber-500 to-orange-500 opacity-10 blur-3xl animate-[pulse_6s_ease-in-out_infinite_2s]" />

          <div className="absolute top-20 right-20 h-20 w-20 rotate-45 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm animate-[bounce_6s_ease-in-out_infinite]" />
          <div className="absolute bottom-32 left-20 h-16 w-16 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm animate-[bounce_5s_ease-in-out_infinite_1s]" />
          <div className="absolute top-1/2 left-1/4 h-12 w-12 rotate-12 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm animate-[bounce_7s_ease-in-out_infinite_0.5s]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-12">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex flex-col">
                <Image src="/logo.png" alt="Bitora" width={164} height={164} />
                {/* <span className="text-sm text-zinc-400 mt-2">Ticket System</span> */}
              </div>
            </Link>

            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <div className="h-10 w-10 rounded-full border-2 border-zinc-950 bg-linear-to-br from-violet-400 to-violet-600" />
                    <div className="h-10 w-10 rounded-full border-2 border-zinc-950 bg-linear-to-br from-cyan-400 to-cyan-600" />
                    <div className="h-10 w-10 rounded-full border-2 border-zinc-950 bg-linear-to-br from-fuchsia-400 to-fuchsia-600" />
                    <div className="h-10 w-10 rounded-full border-2 border-zinc-950 bg-linear-to-br from-amber-400 to-amber-600" />
                  </div>
                  <div className="text-white">
                    <p className="font-medium">Join to get support</p>
                    <p className="text-sm text-zinc-400">Get support from our team</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-md space-y-4">
              <p className="text-sm text-zinc-400">
                Powered by <span className="font-semibold text-white">Bitora</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right auth content panel */}
        <div className="flex w-full items-center bg-background justify-center py-8 lg:w-1/2 lg:py-0">
          <div className="relative w-full max-w-md backdrop-blur-xl">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
