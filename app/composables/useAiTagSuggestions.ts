import type { SuggestTagsResponse } from '~/types/ai'
import type { SuggestRecordTagsValue } from '~/types/record-form'

export const useAiTagSuggestions = () => {
  const suggestedTags = ref<string[]>([])
  const suggestTagsPending = ref(false)
  const suggestTagsError = ref('')

  const requestSuggestedTags = async (value: SuggestRecordTagsValue) => {
    if (suggestTagsPending.value) {
      return
    }

    suggestTagsPending.value = true
    suggestTagsError.value = ''

    try {
      const response = await $fetch<SuggestTagsResponse>('/api/ai/suggest-tags', {
        method: 'POST',
        body: {
          title: value.title,
          content: value.content,
          category: value.category,
          moodScore: value.moodScore,
          constructivenessScore: value.constructivenessScore,
          energyCostScore: value.energyCostScore,
          existingTags: value.existingTags,
          selectedTags: value.tags,
        },
      })

      suggestedTags.value = response.suggestedTags

      if (response.suggestedTags.length === 0) {
        suggestTagsError.value = '这次没有找到新的推荐标签，可以先手动添加。'
      }
    } catch {
      suggestTagsError.value = '这次没有推荐成功，可以先手动添加。'
    } finally {
      suggestTagsPending.value = false
    }
  }

  return {
    requestSuggestedTags,
    suggestedTags,
    suggestTagsError,
    suggestTagsPending,
  }
}
