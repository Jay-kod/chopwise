export const INTEGRATIONS_REGISTRY = [
  {
    id: 'gemini',
    title: 'Google Gemini API',
    description:
      'Powers structured Nigerian meal recommendations and initial calorie/macronutrient estimations.',
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
      'Paste the key into the API key field below.',
      'Specify a Flash-tier model (e.g. gemini-2.5-flash) from the Models list.',
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
        help: 'Starts with AIza. Write-only; leave blank to keep current key.',
      },
      {
        key: 'model',
        label: 'Model Name',
        type: 'text',
        help: 'Recommended: gemini-2.5-flash or gemini-1.5-flash.',
      },
    ],
  },
  {
    id: 'edamam',
    title: 'Edamam Nutrition Analysis API',
    description:
      'Performs ingredient-level dietary analysis and calculates vitamins/minerals for recipe details.',
    helpLinks: [
      { label: 'Developer Portal', url: 'https://developer.edamam.com/' },
      { label: 'API FAQ', url: 'https://developer.edamam.com/api/faq' },
      { label: 'Sign-up Guide', url: 'https://edamamhelp.zendesk.com/hc/en-us/articles/4422823511959-Signing-Up-For-an-API-Without-an-Account' },
      { label: 'Nutrition API Documentation', url: 'https://developer.edamam.com/edamam-docs-nutrition-api' },
    ],
    steps: [
      'Create a developer account at developer.edamam.com.',
      'In Dashboard > Applications, select "Create New Application".',
      'Choose the "Nutrition Analysis API" with the free Developer plan.',
      'Copy your Application ID and Application Key.',
      'Paste both fields below, toggle Enabled to On, click Save, and run Test.',
    ],
    notes: [
      'Keys from the Recipe Search API will fail with 401; you must use the Nutrition Analysis API.',
      'When Edamam cannot parse an indigenous Nigerian ingredient, ChopWise automatically falls back to AI estimates.',
      'Edamam requires visible attribution ("Powered by Edamam") wherever its data is shown.',
    ],
    fields: [
      {
        key: 'appId',
        label: 'Application ID',
        type: 'secret',
        help: 'Found on your Edamam developer dashboard.',
      },
      {
        key: 'appKey',
        label: 'Application Key',
        type: 'secret',
        help: 'Found on your Edamam developer dashboard.',
      },
      {
        key: 'enabled',
        label: 'Enable Edamam Nutrition',
        type: 'toggle',
        help: 'When disabled, ChopWise relies entirely on Gemini nutrition estimates.',
      },
    ],
  },
];

