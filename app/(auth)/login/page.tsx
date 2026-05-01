"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Bot } from "lucide-react";

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your AI SaaS dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Field>
              {loginError && (
                <FieldError>
                  {loginError.message || "Invalid email or password"}
                </FieldError>
              )}
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? <Spinner className="mr-2" /> : null}
                {isLoggingIn ? "Signing in..." : "Sign in"}
              </Button>
            </FieldGroup>
          </form>
          <div className="mt-6 rounded-lg border border-muted bg-muted/50 p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Demo Credentials
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Admin:</span>{" "}
                <code className="text-foreground">admin@example.com</code> / <code className="text-foreground">admin123</code>
              </p>
              <p>
                <span className="text-muted-foreground">Member:</span>{" "}
                <code className="text-foreground">member@example.com</code> / <code className="text-foreground">member123</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
