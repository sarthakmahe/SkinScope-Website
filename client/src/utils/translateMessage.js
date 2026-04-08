const messageKeyMap = {
  'Passwords do not match': 'password_mismatch',
  'Please fill all fields': 'contact_fill_all',
  'Failed to load records': 'failed_load_records',
  'Failed to get prediction. Please try again.': 'predict_failed',
  'Error creating blog post': 'blog_create_error',
  'Download failed': 'download_failed',
  'Unable to get a response right now.': 'chat_error_unavailable',
  'I could not generate a response right now.': 'chat_response_fallback',
  'Error connecting to the AI server. Please try again.': 'chat_error_generic'
};

export const translateMessage = (message, t) => {
  const translationKey = messageKeyMap[message];
  return translationKey ? t(translationKey) : message;
};
