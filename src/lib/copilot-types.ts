// TypeScript types for the GitHub Copilot Metrics API
// Docs: https://docs.github.com/en/rest/copilot/copilot-metrics

export interface CopilotLanguageMetrics {
  name: string
  total_engaged_users: number
  total_code_suggestions?: number
  total_code_acceptances?: number
  total_code_lines_suggested?: number
  total_code_lines_accepted?: number
}

export interface CopilotEditorMetrics {
  name: string
  total_engaged_users: number
  models?: CopilotModelMetrics[]
}

export interface CopilotModelMetrics {
  name: string
  is_custom_model: boolean
  custom_model_training_date?: string | null
  total_engaged_users?: number
  languages?: CopilotLanguageMetrics[]
}

export interface CopilotIdeCodeCompletions {
  total_engaged_users: number
  languages?: CopilotLanguageMetrics[]
  editors?: CopilotEditorMetrics[]
}

export interface CopilotIdeChat {
  total_engaged_users: number
  total_chats?: number
  total_chat_insertion_events?: number
  total_chat_copy_events?: number
  editors?: CopilotEditorMetrics[]
}

export interface CopilotDotcomChat {
  total_engaged_users: number
  total_chats?: number
  models?: CopilotModelMetrics[]
}

export interface CopilotDotcomPullRequests {
  total_engaged_users: number
  repositories?: {
    name: string
    total_engaged_users: number
    models?: CopilotModelMetrics[]
  }[]
}

export interface CopilotMetricsDay {
  date: string
  total_active_users: number
  total_engaged_users: number
  copilot_ide_code_completions?: CopilotIdeCodeCompletions
  copilot_ide_chat?: CopilotIdeChat
  copilot_dotcom_chat?: CopilotDotcomChat
  copilot_dotcom_pull_requests?: CopilotDotcomPullRequests
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  updated_at: string
}

export interface RepoMetricsSummary {
  repoName: string
  repoFullName: string
  totalActiveUsers: number
  totalEngagedUsers: number
  totalSuggestions: number
  totalAcceptances: number
  totalLinesAccepted: number
  totalLinesSuggested: number
  acceptanceRate: number
  chatUsers: number
  totalChats: number
  days: CopilotMetricsDay[]
  error?: string
}

export interface OrgSummary {
  totalRepos: number
  reposWithData: number
  totalActiveUsers: number
  totalEngagedUsers: number
  totalSuggestions: number
  totalAcceptances: number
  totalLinesAccepted: number
  totalLinesSuggested: number
  acceptanceRate: number
  totalChatUsers: number
  totalChats: number
}

export interface CopilotConfig {
  org: string
  token: string
}
