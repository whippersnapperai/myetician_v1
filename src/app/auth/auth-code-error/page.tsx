export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-muted-foreground mb-4">
          There was an error during the authentication process.
        </p>
        <a 
          href="/onboarding" 
          className="text-primary hover:underline"
        >
          Return to sign in
        </a>
      </div>
    </div>
  )
}