export interface AiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AiTaskRequest {
  messages: AiMessage[]
  temperature?: number
  taskType?: string
  modelName?: string
  promptVersion?: string
  requestId?: string
  recordId?: string
  weeklyReviewId?: string
  aiAnalysisId?: string
}

export interface AiChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}
