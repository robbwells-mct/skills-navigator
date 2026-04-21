import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts'
import {
  listOrgRepos,
  fetchRepoMetrics,
  buildRepoSummary,
  buildOrgSummary,
} from '@/lib/github-copilot'
import type { CopilotConfig, RepoMetricsSummary, OrgSummary } from '@/lib/copilot-types'
import {
  ArrowsClockwise, SignOut, SortAscending, SortDescending,
  MagnifyingGlass, CheckCircle, XCircle, Warning,
  Users, ChartBar, Code, Chat,
} from '@phosphor-icons/react'
import { subDays, format } from 'date-fns'

// Acceptance rate thresholds and chart colors
const RATE_HIGH = 30
const RATE_MED = 15
const COLOR_HIGH = 'oklch(0.55 0.18 155)'
const COLOR_MED = 'oklch(0.55 0.18 250)'
const COLOR_LOW = 'oklch(0.55 0.18 30)'

function acceptanceColor(rate: number): string {
  if (rate >= RATE_HIGH) return COLOR_HIGH
  if (rate >= RATE_MED) return COLOR_MED
  return COLOR_LOW
}

function acceptanceTextClass(rate: number): string {
  if (rate >= RATE_HIGH) return 'text-green-600 font-semibold'
  if (rate >= RATE_MED) return 'text-blue-600'
  return 'text-orange-500'
}

function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100)
}

type SortField = 'repoName' | 'totalSuggestions' | 'totalAcceptances' | 'acceptanceRate' | 'totalEngagedUsers' | 'totalChats'
type SortDir = 'asc' | 'desc'
type DateRange = '7' | '14' | '28' | 'custom'

interface CopilotDashboardProps {
  config: CopilotConfig
  onDisconnect: () => void
}

type StatCardColor = {
  border: string
  bg: string
}

const STAT_COLORS: Record<string, StatCardColor> = {
  blue:    { border: 'border-l-blue-500',    bg: 'bg-blue-50' },
  indigo:  { border: 'border-l-indigo-500',  bg: 'bg-indigo-50' },
  green:   { border: 'border-l-green-500',   bg: 'bg-green-50' },
  purple:  { border: 'border-l-purple-500',  bg: 'bg-purple-50' },
  sky:     { border: 'border-l-sky-400',     bg: 'bg-sky-50' },
  emerald: { border: 'border-l-emerald-400', bg: 'bg-emerald-50' },
  violet:  { border: 'border-l-violet-400',  bg: 'bg-violet-50' },
}

function StatCard({
  label, value, sub, icon: Icon, colorKey,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  colorKey: keyof typeof STAT_COLORS
}) {
  const colors = STAT_COLORS[colorKey]
  return (
    <Card className={`border-l-4 ${colors.border}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon size={22} className="text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CopilotDashboard({ config, onDisconnect }: CopilotDashboardProps) {
  const [repos, setRepos] = useState<RepoMetricsSummary[]>([])
  const [orgSummary, setOrgSummary] = useState<OrgSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fetched, setFetched] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange>('28')
  const [customSince, setCustomSince] = useState(format(subDays(new Date(), 28), 'yyyy-MM-dd'))
  const [customUntil, setCustomUntil] = useState(format(new Date(), 'yyyy-MM-dd'))

  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('totalSuggestions')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const getSinceDateParam = () => {
    if (dateRange === 'custom') return customSince
    return format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd')
  }
  const getUntilDateParam = () => {
    if (dateRange === 'custom') return customUntil
    return format(new Date(), 'yyyy-MM-dd')
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setRepos([])
    setOrgSummary(null)
    setProgress(0)
    setFetched(false)

    try {
      setProgressLabel('Fetching repository list…')
      const allRepos = await listOrgRepos(config.org, config.token)
      setProgress(10)

      const since = getSinceDateParam()
      const until = getUntilDateParam()
      const results: RepoMetricsSummary[] = []
      const total = allRepos.length

      for (let i = 0; i < total; i++) {
        const repo = allRepos[i]
        setProgressLabel(`Fetching metrics for ${repo.name} (${i + 1}/${total})…`)
        try {
          const days = await fetchRepoMetrics(config.org, repo.name, config.token, since, until)
          results.push(buildRepoSummary(repo.name, repo.full_name, days ?? []))
        } catch {
          results.push(buildRepoSummary(repo.name, repo.full_name, [], `No metrics available`))
        }
        setProgress(10 + Math.round(((i + 1) / total) * 90))
      }

      setRepos(results)
      setOrgSummary(buildOrgSummary(results))
      setFetched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data. Please try again.')
    } finally {
      setLoading(false)
      setProgress(100)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, dateRange, customSince, customUntil])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const filteredSorted = useMemo(() => {
    let list = repos.filter(r =>
      r.repoName.toLowerCase().includes(search.toLowerCase())
    )
    list = [...list].sort((a, b) => {
      const av = a[sortField] as number | string
      const bv = b[sortField] as number | string
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [repos, search, sortField, sortDir])

  const chartData = useMemo(() => {
    return [...repos]
      .filter(r => r.totalSuggestions > 0)
      .sort((a, b) => b.acceptanceRate - a.acceptanceRate)
      .slice(0, 20)
      .map(r => ({
        name: r.repoName.length > 15 ? r.repoName.slice(0, 13) + '…' : r.repoName,
        fullName: r.repoName,
        acceptanceRate: r.acceptanceRate,
        suggestions: r.totalSuggestions,
      }))
  }, [repos])

  const chartConfig = {
    acceptanceRate: { label: 'Acceptance Rate (%)', color: 'oklch(0.55 0.18 250)' },
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDir === 'asc'
      ? <SortAscending size={14} className="ml-1 inline" />
      : <SortDescending size={14} className="ml-1 inline" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Copilot IDE Usage</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Organization: <span className="font-medium text-foreground">{config.org}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDisconnect}>
            <SignOut size={16} className="mr-1.5" />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Date range + fetch */}
      <Card className="border-blue-100 bg-blue-50/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Date Range</label>
              <Select value={dateRange} onValueChange={v => setDateRange(v as DateRange)}>
                <SelectTrigger className="w-44 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="28">Last 28 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">From</label>
                  <Input
                    type="date"
                    value={customSince}
                    onChange={e => setCustomSince(e.target.value)}
                    className="w-40 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">To</label>
                  <Input
                    type="date"
                    value={customUntil}
                    onChange={e => setCustomUntil(e.target.value)}
                    className="w-40 bg-white"
                  />
                </div>
              </>
            )}

            <Button onClick={fetchData} disabled={loading} className="self-end">
              <ArrowsClockwise size={16} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading…' : fetched ? 'Refresh' : 'Load Data'}
            </Button>
          </div>

          {loading && (
            <div className="mt-3 space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{progressLabel}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary cards */}
      {fetched && orgSummary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Repositories"
              value={orgSummary.totalRepos}
              sub={`${orgSummary.reposWithData} with Copilot data`}
              icon={ChartBar}
              colorKey="blue"
            />
            <StatCard
              label="Total Suggestions"
              value={orgSummary.totalSuggestions}
              sub={`${orgSummary.totalLinesAccepted.toLocaleString()} lines accepted`}
              icon={Code}
              colorKey="indigo"
            />
            <StatCard
              label="Acceptance Rate"
              value={`${orgSummary.acceptanceRate}%`}
              sub={`${orgSummary.totalAcceptances.toLocaleString()} acceptances`}
              icon={CheckCircle}
              colorKey="green"
            />
            <StatCard
              label="Engaged Users"
              value={orgSummary.totalEngagedUsers}
              sub={`${orgSummary.totalChats.toLocaleString()} chats`}
              icon={Users}
              colorKey="purple"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Lines Suggested"
              value={orgSummary.totalLinesSuggested}
              icon={Code}
              colorKey="sky"
            />
            <StatCard
              label="Lines Accepted"
              value={orgSummary.totalLinesAccepted}
              sub={orgSummary.totalLinesSuggested > 0 ? `${pct(orgSummary.totalLinesAccepted, orgSummary.totalLinesSuggested)}% of suggested` : undefined}
              icon={CheckCircle}
              colorKey="emerald"
            />
            <StatCard
              label="IDE Chat Users"
              value={orgSummary.totalChatUsers}
              sub={`${orgSummary.totalChats.toLocaleString()} total chats`}
              icon={Chat}
              colorKey="violet"
            />
          </div>

          {/* Acceptance rate chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Acceptance Rate by Repository (top {chartData.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={v => `${v}%`}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, _name, props) => [
                            `${value}% acceptance (${(props.payload as { suggestions: number }).suggestions?.toLocaleString()} suggestions)`,
                            props.payload.fullName,
                          ]}
                        />
                      }
                    />
                    <Bar dataKey="acceptanceRate" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={acceptanceColor(entry.acceptanceRate)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Green ≥ {RATE_HIGH}% · Blue ≥ {RATE_MED}% · Orange &lt; {RATE_MED}%
                </p>
              </CardContent>
            </Card>
          )}

          {/* Per-repo table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Per-Repository Breakdown
                  <Badge variant="secondary" className="ml-2 text-xs">{repos.length} repos</Badge>
                </CardTitle>
                <div className="relative">
                  <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Filter repos…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 w-52 h-8 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer select-none hover:text-foreground pl-4"
                        onClick={() => toggleSort('repoName')}
                      >
                        Repository <SortIcon field="repoName" />
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:text-foreground text-right"
                        onClick={() => toggleSort('totalEngagedUsers')}
                      >
                        Users <SortIcon field="totalEngagedUsers" />
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:text-foreground text-right"
                        onClick={() => toggleSort('totalSuggestions')}
                      >
                        Suggestions <SortIcon field="totalSuggestions" />
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:text-foreground text-right"
                        onClick={() => toggleSort('totalAcceptances')}
                      >
                        Acceptances <SortIcon field="totalAcceptances" />
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:text-foreground text-right"
                        onClick={() => toggleSort('acceptanceRate')}
                      >
                        Rate <SortIcon field="acceptanceRate" />
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:text-foreground text-right"
                        onClick={() => toggleSort('totalChats')}
                      >
                        Chats <SortIcon field="totalChats" />
                      </TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSorted.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No repositories match your filter.
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredSorted.map(repo => (
                      <TableRow key={repo.repoFullName}>
                        <TableCell className="pl-4 font-medium">
                          <a
                            href={`https://github.com/${repo.repoFullName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 hover:underline"
                          >
                            {repo.repoName}
                          </a>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {repo.totalEngagedUsers || '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {repo.totalSuggestions > 0 ? repo.totalSuggestions.toLocaleString() : '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {repo.totalAcceptances > 0 ? repo.totalAcceptances.toLocaleString() : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {repo.totalSuggestions > 0 ? (
                            <span className={acceptanceTextClass(repo.acceptanceRate)}>
                              {repo.acceptanceRate}%
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {repo.totalChats > 0 ? repo.totalChats.toLocaleString() : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          {repo.error ? (
                            <span title={repo.error}>
                              <XCircle size={18} className="text-muted-foreground/50 inline" />
                            </span>
                          ) : repo.totalSuggestions > 0 ? (
                            <CheckCircle size={18} className="text-green-500 inline" />
                          ) : (
                            <Warning size={18} className="text-amber-400 inline" title="No Copilot data for this period" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-4 py-2 border-t text-xs text-muted-foreground flex gap-4">
                <span><CheckCircle size={12} className="text-green-500 inline mr-1" />Has data</span>
                <span><Warning size={12} className="text-amber-400 inline mr-1" />No data for period</span>
                <span><XCircle size={12} className="text-muted-foreground/50 inline mr-1" />Copilot not enabled / no access</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!fetched && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <ChartBar size={40} className="text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Ready to load metrics</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Select a date range above and click "Load Data" to fetch Copilot IDE usage for all repositories in <strong>{config.org}</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
