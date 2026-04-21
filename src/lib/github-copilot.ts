import {
  CopilotMetricsDay,
  GitHubRepo,
  RepoMetricsSummary,
  OrgSummary,
} from './copilot-types'

const GITHUB_API = 'https://api.github.com'

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function checkResponse(res: Response): Promise<void> {
  if (res.ok) return
  if (res.status === 401) throw new Error('Invalid token. Check your GitHub PAT.')
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}))
    const msg = (body as { message?: string }).message || ''
    if (msg.toLowerCase().includes('copilot')) {
      throw new Error('Token lacks Copilot access. Ensure it has manage_billing:copilot or copilot scope.')
    }
    throw new Error('Forbidden. The token may not have sufficient permissions (need manage_billing:copilot or read:org).')
  }
  if (res.status === 404) throw new Error('Organization not found. Check the org name.')
  if (res.status === 429) throw new Error('GitHub API rate limit exceeded. Wait a moment and try again.')
  const body = await res.json().catch(() => ({}))
  throw new Error((body as { message?: string }).message || `GitHub API error ${res.status}`)
}

/** Validate the token and org by fetching basic org info. */
export async function validateOrgToken(org: string, token: string): Promise<void> {
  const res = await fetch(`${GITHUB_API}/orgs/${encodeURIComponent(org)}`, { headers: headers(token) })
  await checkResponse(res)
}

/** List all repos for an org (handles pagination). */
export async function listOrgRepos(org: string, token: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = []
  let page = 1
  while (true) {
    const res = await fetch(
      `${GITHUB_API}/orgs/${encodeURIComponent(org)}/repos?per_page=100&page=${page}&type=all`,
      { headers: headers(token) }
    )
    await checkResponse(res)
    const batch: GitHubRepo[] = await res.json()
    if (batch.length === 0) break
    repos.push(...batch)
    if (batch.length < 100) break
    page++
  }
  return repos
}

/** Fetch Copilot metrics for a single repo. Returns null if endpoint returns 404/no data. */
export async function fetchRepoMetrics(
  owner: string,
  repo: string,
  token: string,
  since?: string,
  until?: string
): Promise<CopilotMetricsDay[] | null> {
  let url = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/copilot/metrics`
  const params = new URLSearchParams()
  if (since) params.set('since', since)
  if (until) params.set('until', until)
  if ([...params].length > 0) url += `?${params.toString()}`

  const res = await fetch(url, { headers: headers(token) })
  if (res.status === 404) return null
  if (res.status === 422) return null // Copilot not enabled for this repo
  await checkResponse(res)
  return res.json()
}

/** Fetch org-wide Copilot metrics. */
export async function fetchOrgMetrics(
  org: string,
  token: string,
  since?: string,
  until?: string
): Promise<CopilotMetricsDay[]> {
  let url = `${GITHUB_API}/orgs/${encodeURIComponent(org)}/copilot/metrics`
  const params = new URLSearchParams()
  if (since) params.set('since', since)
  if (until) params.set('until', until)
  if ([...params].length > 0) url += `?${params.toString()}`

  const res = await fetch(url, { headers: headers(token) })
  await checkResponse(res)
  return res.json()
}

/** Compute aggregated suggestions/acceptances from a set of metrics days. */
function aggregateDays(days: CopilotMetricsDay[]): {
  totalActiveUsers: number
  totalEngagedUsers: number
  totalSuggestions: number
  totalAcceptances: number
  totalLinesAccepted: number
  totalLinesSuggested: number
  chatUsers: number
  totalChats: number
} {
  let totalActiveUsers = 0
  let totalEngagedUsers = 0
  let totalSuggestions = 0
  let totalAcceptances = 0
  let totalLinesAccepted = 0
  let totalLinesSuggested = 0
  let chatUsers = 0
  let totalChats = 0

  const seenActive = new Set<string>()
  const seenEngaged = new Set<string>()

  for (const day of days) {
    // Use unique user counts from peak day approach (simpler: sum, acknowledge overlap)
    if (!seenActive.has(day.date)) {
      totalActiveUsers += day.total_active_users
      seenActive.add(day.date)
    }
    if (!seenEngaged.has(day.date)) {
      totalEngagedUsers += day.total_engaged_users
      seenEngaged.add(day.date)
    }

    const completions = day.copilot_ide_code_completions
    if (completions?.languages) {
      for (const lang of completions.languages) {
        totalSuggestions += lang.total_code_suggestions ?? 0
        totalAcceptances += lang.total_code_acceptances ?? 0
        totalLinesAccepted += lang.total_code_lines_accepted ?? 0
        totalLinesSuggested += lang.total_code_lines_suggested ?? 0
      }
    }

    if (day.copilot_ide_chat) {
      chatUsers += day.copilot_ide_chat.total_engaged_users
      totalChats += day.copilot_ide_chat.total_chats ?? 0
    }
  }

  return {
    totalActiveUsers,
    totalEngagedUsers,
    totalSuggestions,
    totalAcceptances,
    totalLinesAccepted,
    totalLinesSuggested,
    chatUsers,
    totalChats,
  }
}

/** Build a RepoMetricsSummary from raw days data. */
export function buildRepoSummary(
  repoName: string,
  repoFullName: string,
  days: CopilotMetricsDay[],
  error?: string
): RepoMetricsSummary {
  if (error || days.length === 0) {
    return {
      repoName,
      repoFullName,
      totalActiveUsers: 0,
      totalEngagedUsers: 0,
      totalSuggestions: 0,
      totalAcceptances: 0,
      totalLinesAccepted: 0,
      totalLinesSuggested: 0,
      acceptanceRate: 0,
      chatUsers: 0,
      totalChats: 0,
      days,
      error,
    }
  }

  const agg = aggregateDays(days)
  const acceptanceRate =
    agg.totalSuggestions > 0
      ? Math.round((agg.totalAcceptances / agg.totalSuggestions) * 1000) / 10
      : 0

  return {
    repoName,
    repoFullName,
    ...agg,
    acceptanceRate,
    days,
  }
}

/** Build an org-wide summary from all repo summaries. */
export function buildOrgSummary(repos: RepoMetricsSummary[]): OrgSummary {
  const reposWithData = repos.filter(r => !r.error && r.totalSuggestions > 0).length
  const totalSuggestions = repos.reduce((s, r) => s + r.totalSuggestions, 0)
  const totalAcceptances = repos.reduce((s, r) => s + r.totalAcceptances, 0)

  return {
    totalRepos: repos.length,
    reposWithData,
    totalActiveUsers: Math.max(...repos.map(r => r.totalActiveUsers), 0),
    totalEngagedUsers: Math.max(...repos.map(r => r.totalEngagedUsers), 0),
    totalSuggestions,
    totalAcceptances,
    totalLinesAccepted: repos.reduce((s, r) => s + r.totalLinesAccepted, 0),
    totalLinesSuggested: repos.reduce((s, r) => s + r.totalLinesSuggested, 0),
    acceptanceRate:
      totalSuggestions > 0
        ? Math.round((totalAcceptances / totalSuggestions) * 1000) / 10
        : 0,
    totalChatUsers: repos.reduce((s, r) => s + r.chatUsers, 0),
    totalChats: repos.reduce((s, r) => s + r.totalChats, 0),
  }
}
