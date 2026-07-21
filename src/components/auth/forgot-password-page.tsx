export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Forgot Password</h1>
          <p className="text-muted-foreground">
            Enter your email to reset your password
          </p>
        </div>
        {/* Add forgot password form here */}
      </div>
    </div>
  );
}
