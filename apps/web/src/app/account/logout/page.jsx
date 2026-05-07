"use client";

import { useEffect } from "react";
import useAuth from "@/utils/useAuth";
import { Shield } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut({
      callbackUrl: "/",
      redirect: true,
    });
  }, [signOut]);

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter'] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Signing out...
        </h1>
        <p className="text-sm text-gray-500">
          Please wait while we sign you out
        </p>
      </div>
    </div>
  );
}
