"use client";

import { useState } from "react";
import { Lock, Loader2, Eye, EyeOff, KeyRound, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/features/auth/api";
import { useAuth } from "@/features/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isApiTokenVisible, setIsApiTokenVisible] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("");
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Failed to change password";

      // Map API errors to appropriate fields
      if (errorMessage.toLowerCase().includes("current password") ||
        errorMessage.toLowerCase().includes("incorrect")) {
        setCurrentPasswordError(errorMessage);
        setNewPasswordError("");
        setConfirmPasswordError("");
      } else {
        // Generic error - could be validation or other issues
        setNewPasswordError(errorMessage);
        setCurrentPasswordError("");
        setConfirmPasswordError("");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setNewPasswordError("Password must be at least 8 characters");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
    if (currentPasswordError) {
      setCurrentPasswordError("");
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (newPasswordError) {
      setNewPasswordError("");
    }
    if (confirmPasswordError && e.target.value === confirmPassword) {
      setConfirmPasswordError("");
    }
  };

  const handleNewPasswordBlur = () => {
    if (newPassword && newPassword.length < 8) {
      setNewPasswordError("Password must be at least 8 characters");
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (confirmPasswordError) {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && confirmPassword.length < 8) {
      setConfirmPasswordError("Password must be at least 8 characters");
    } else if (confirmPassword && newPassword && confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match");
    }
  };

  const handleCopyToken = async () => {
    if (!user?.apiToken) {
      toast.error("API token is not available yet");
      return;
    }
    await navigator.clipboard.writeText(user.apiToken);
    toast.success("API token copied to clipboard");
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl">API Token</CardTitle>
          <CardDescription>
            Use this token to connect external integrations like Homarr
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiToken">Token</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="apiToken"
                type={isApiTokenVisible ? "text" : "password"}
                value={user?.apiToken ?? ""}
                readOnly
                className="pl-10 pr-10 h-12 bg-background/50"
              />
              {user?.apiToken && (
                <button
                  type="button"
                  onClick={() => setIsApiTokenVisible(!isApiTokenVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isApiTokenVisible ? (
                    <EyeOff className="h-4 w-4 opacity-40" />
                  ) : (
                    <Eye className="h-4 w-4 opacity-40" />
                  )}
                </button>
              )}
            </div>
            {!user?.apiToken && (
              <p className="text-xs text-muted-foreground">
                Your token will appear after your account is fully initialized.
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyToken}
            disabled={!user?.apiToken}
            className="gap-2 active:scale-95"
          >
            <Copy className="h-4 w-4" />
            Copy token
          </Button>
        </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl">Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={isCurrentPasswordVisible ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={handleCurrentPasswordChange}
                  className={cn(
                    "pl-10 pr-10 h-12 bg-background/50",
                    currentPasswordError && "border-destructive focus:border-destructive focus:ring-destructive/20"
                  )}
                  aria-invalid={!!currentPasswordError}
                  required
                />
                {currentPassword && (
                  <button
                    type="button"
                    onClick={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isCurrentPasswordVisible ? (
                      <EyeOff className="h-4 w-4 opacity-40" />
                    ) : (
                      <Eye className="h-4 w-4 opacity-40" />
                    )}
                  </button>
                )}
              </div>
              {currentPasswordError && (
                <p className="text-xs text-destructive px-1">
                  {currentPasswordError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={isNewPasswordVisible ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  onBlur={handleNewPasswordBlur}
                  className={cn(
                    "pl-10 pr-10 h-12 bg-background/50",
                    newPasswordError && "border-destructive focus:border-destructive focus:ring-destructive/20"
                  )}
                  aria-invalid={!!newPasswordError}
                  required
                />
                {newPassword && (
                  <button
                    type="button"
                    onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isNewPasswordVisible ? (
                      <EyeOff className="h-4 w-4 opacity-40" />
                    ) : (
                      <Eye className="h-4 w-4 opacity-40" />
                    )}
                  </button>
                )}
              </div>
              {newPasswordError ? (
                <p className="text-xs text-destructive px-1">
                  {newPasswordError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={handleConfirmPasswordBlur}
                  className={cn(
                    "pl-10 pr-10 h-12 bg-background/50",
                    confirmPasswordError && "border-destructive focus:border-destructive focus:ring-destructive/20"
                  )}
                  aria-invalid={!!confirmPasswordError}
                  required
                />
                {confirmPassword && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeOff className="h-4 w-4 opacity-40" />
                    ) : (
                      <Eye className="h-4 w-4 opacity-40" />
                    )}
                  </button>
                )}
              </div>
              {confirmPasswordError && (
                <p className="text-xs text-destructive px-1">
                  {confirmPasswordError}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
