export const INTEGRATIONS_REGISTRY = [
  {
    id: 'gemini',
    title: 'Google Gemini API',
    description:
      'Powers Nigerian meal recommendations, nutrition estimates, and general food feedback on customer meal details.',
    helpLinks: [
      { label: 'Get API Key (Docs)', url: 'https://ai.google.dev/gemini-api/docs/api-key' },
      { label: 'Google AI Studio', url: 'https://aistudio.google.com/' },
      { label: 'Gemini Models List', url: 'https://ai.google.dev/gemini-api/docs/models' },
      { label: 'Structured Output Guide', url: 'https://ai.google.dev/gemini-api/docs/structured-output' },
    ],
    steps: [
      'Open Google AI Studio and sign in with your Google account.',
      'Navigate to API Keys and select "Create API key" (new or existing Google Cloud project).',
      'Copy your API key (starts with AIza).',
      'Paste the key into the API key field below to automatically load available models.',
      'Select a recommended Flash-tier model (e.g. gemini-2.5-flash) from the dropdown list.',
      'Click Save, then Test to verify connection.',
    ],
    notes: [
      'Free tier has generous per-minute rate limits.',
      'Secrets are encrypted at rest with AES-256-GCM and never returned to the client.',
    ],
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'secret',
        help: 'Starts with AIza. Write-only; input key to automatically query live available models.',
      },
      {
        key: 'model',
        label: 'Model Name',
        type: 'text',
        help: 'Recommended: gemini-2.5-flash or gemini-2.0-flash. Selected from live dropdown.',
      },
    ],
  },
  {
    id: 'usda',
    title: 'USDA FoodData Central',
    description:
      'Powers customer meal-detail nutrition lookups using USDA food-composition records for ingredients measured in grams.',
    helpLinks: [
      { label: 'FoodData Central API guide', url: 'https://fdc.nal.usda.gov/api-guide' },
      { label: 'Get a free API key', url: 'https://fdc.nal.usda.gov/api-key-signup' },
    ],
    steps: [
      'Request a free data.gov API key using the USDA key sign-up link.',
      'Copy the API key from the data.gov confirmation.',
      'Paste the key below, switch Enabled on, click Save, and run Test.',
    ],
    notes: [
      'FoodData Central is a food-composition database, not a natural-language recipe parser. ChopWise searches each ingredient and only computes a result when every ingredient has a USDA match and a gram quantity.',
      'Unmatched ingredients or non-gram quantities use the meal’s AI nutrition estimate instead.',
      'USDA FoodData Central data is public domain; display source attribution wherever USDA data is shown.',
      'Keep the API key private. USDA documents a default limit of 1,000 requests per hour per IP address.',
    ],
    fields: [
      {
        key: 'apiKey',
        label: 'USDA API Key',
        type: 'secret',
        help: 'Free data.gov key used only by the server; stored encrypted.',
      },
      {
        key: 'enabled',
        label: 'Enable USDA Nutrition',
        type: 'toggle',
        help: 'When disabled, ChopWise relies entirely on Gemini nutrition estimates.',
      },
    ],
  },
];
