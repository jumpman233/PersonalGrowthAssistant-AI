export interface AiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AiTaskRequest {
  messages: AiMessage[]
  temperature?: number
}

export interface AiChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}
