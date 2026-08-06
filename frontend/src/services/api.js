const getInitialBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://anviora-ai-backend.onrender.com";
  }
  return "http://localhost:8000";
};

export const BASE_URL = getInitialBaseUrl().replace(/\/$/, "");

const request = async (url, options = {}) => {
  const token = localStorage.getItem("anviora_token");
  
  // Prepare headers, leaving them empty for FormData so fetch handles boundaries automatically
  const headers = {};
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const mergedHeaders = { ...headers, ...options.headers };
  
  let response;
  try {
    response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: mergedHeaders,
    });
  } catch (networkError) {
    // fetch() throws TypeError on network failure / CORS block
    throw new Error(`Cannot reach backend at ${BASE_URL}. Make sure FastAPI is online.`);
  }
  
  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
      } catch (e) {}
    } else {
      try {
        const text = await response.text();
        if (text) errorMsg = text;
      } catch (e) {}
    }
    
    if (response.status === 503 || errorMsg.toLowerCase().includes('gemini') || errorMsg.toLowerCase().includes('ai unavailable')) {
      throw new Error("AI service is temporarily unavailable. Please try again in a moment.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(errorMsg);
  }
  
  // 204 No Content has no body
  if (response.status === 204) {
    return { data: null };
  }
  
  const data = await response.json().catch(() => ({}));
  return { data };
};

const api = {
  get: (url, options = {}) => {
    let finalUrl = url;
    if (options.params) {
      const query = new URLSearchParams(options.params).toString();
      finalUrl = `${url}?${query}`;
    }
    return request(finalUrl, { ...options, method: "GET" });
  },
  
  post: (url, body, options = {}) => {
    const isFormData = body instanceof FormData;
    return request(url, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  
  put: (url, body, options = {}) => {
    return request(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  
  patch: (url, body, options = {}) => {
    return request(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  
  delete: (url, options = {}) => {
    return request(url, { ...options, method: "DELETE" });
  },
};

export default api;

// ─── Centralized AI call (POST /ai/chat) ──────────────────────────────────────
// callAI(message, systemPrompt, options) — returns the AI response string or throws
// systemPrompt is prepended into the message
export const extractJSON = (str) => {
  if (!str) return null;
  let clean = str.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  const firstBrace = clean.indexOf('{');
  const firstBracket = clean.indexOf('[');
  
  let startIdx = -1;
  let endIdx = -1;
  
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = clean.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = clean.lastIndexOf(']');
  }
  
  if (startIdx !== -1 && endIdx > startIdx) {
    return clean.substring(startIdx, endIdx + 1);
  }
  
  return clean;
};

export const callAI = async (message, systemPrompt = '', options = {}) => {
  const { timeout = 35000 } = options;
  
  const apiCall = api.post('/ai/chat', {
    message: message,
    system_prompt: systemPrompt || undefined,
    history: [],
    context: null,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), timeout)
  );

  try {
    const response = await Promise.race([apiCall, timeoutPromise]);
    const reply = response.data?.response;
    if (!reply) throw new Error('No response from AI');
    return reply;
  } catch (error) {
    if (error.message === 'TIMEOUT') {
      throw new Error('AI is taking longer than usual. Please try again.');
    }
    throw error;
  }
};

// AI evaluation helper - evaluates a skill with honest feedback
export const evaluateSkill = async (skillName, experience) => {
  const prompt = `You are an expert skill evaluator. Evaluate the following skill HONESTLY based on industry standards.

Skill: ${skillName}
User Experience: ${experience}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "score": <0-100 honest score>,
  "level": "<beginner|intermediate|advanced|expert>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "improvements": ["<todo1>", "<todo2>", "<todo3>"],
  "feedback": "<honest 2-3 sentence feedback>"
}`;

  try {
    const response = await callAI(prompt, '', { timeout: 15000 });
    const cleanJson = extractJSON(response);
    return JSON.parse(cleanJson);
  } catch (error) {
    throw new Error(`Failed to evaluate skill: ${error.message}`);
  }
};

// AI analysis helper - analyzes placement advice
export const getPlacementAdvice = async (userContext) => {
  const prompt = `Analyze the placement journey and provide actionable advice:

Context: ${userContext}

Respond ONLY with valid JSON:
{
  "advice": "<specific actionable advice>",
  "nextSteps": ["<step1>", "<step2>", "<step3>"],
  "resources": ["<resource1>", "<resource2>"],
  "timeline": "<suggested timeline>"
}`;

  try {
    const response = await callAI(prompt, '', { timeout: 15000 });
    const cleanJson = extractJSON(response);
    return JSON.parse(cleanJson);
  } catch (error) {
    throw new Error(`Failed to get placement advice: ${error.message}`);
  }
};

// Simulated API Helpers (for backward compatibility in local storage mocks)
export const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const getLocalStorage = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
