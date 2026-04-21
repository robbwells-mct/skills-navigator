import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { validateOrgToken } from '@/lib/github-copilot'
import { CopilotConfig } from '@/lib/copilot-types'
import { GithubLogo, Key, Buildings, ArrowRight, Info } from '@phosphor-icons/react'

interface CopilotConfigFormProps {
  onConnect: (config: CopilotConfig) => void
}

export function CopilotConfigForm({ onConnect }: CopilotConfigFormProps) {
  const [org, setOrg] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!org.trim() || !token.trim()) return

    setLoading(true)
    setError(null)
    try {
      await validateOrgToken(org.trim(), token.trim())
      onConnect({ org: org.trim(), token: token.trim() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12">
      <Card className="w-full max-w-lg shadow-lg border-blue-100">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <GithubLogo size={36} className="text-white" weight="fill" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">Connect to GitHub</CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your GitHub organization name and a Personal Access Token to view Copilot IDE usage metrics.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <Info size={16} className="shrink-0 mt-0.5" />
            <AlertDescription className="text-sm ml-2">
              Your token needs the <code className="bg-blue-100 px-1 rounded text-xs font-mono">manage_billing:copilot</code> or <code className="bg-blue-100 px-1 rounded text-xs font-mono">read:org</code> scope. Tokens are never stored.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org" className="text-sm font-medium">
                GitHub Organization
              </Label>
              <div className="relative">
                <Buildings size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="org"
                  placeholder="my-organization"
                  value={org}
                  onChange={e => setOrg(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">The name of your GitHub organization (from github.com/&lt;org&gt;)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token" className="text-sm font-medium">
                Personal Access Token
              </Label>
              <div className="relative">
                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="token"
                  type="password"
                  placeholder="github_pat_..."
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className="pl-10 font-mono text-sm"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Create a token at{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  github.com/settings/tokens
                </a>
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || !org.trim() || !token.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Connect
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
