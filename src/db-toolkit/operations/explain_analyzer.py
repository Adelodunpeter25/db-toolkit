"""Query explain plan analyzer using Gemini AI."""

import json
import google.generativeai as genai
from core.config import settings


class ExplainAnalyzer:
    """Analyze query execution plans using Gemini AI."""
    
    def __init__(self):
        """Initialize Gemini client."""
        if settings.has_gemini_key:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        else:
            self.model = None
    
    def _get_prompt(self, query: str, explain_output: str) -> str:
        """Generate prompt for Gemini."""
        return f"""You are a database performance expert. Analyze this PostgreSQL EXPLAIN output and provide insights.

SQL Query:
```sql
{query}
```

EXPLAIN Output:
```
{explain_output}
```

Provide a JSON response with the following structure:
{{
  "summary": "Brief summary of the query execution plan",
  "performance_score": "good|moderate|poor",
  "bottlenecks": ["List of performance bottlenecks identified"],
  "recommendations": ["List of optimization recommendations"],
  "estimated_cost": "Total cost from explain plan",
  "key_operations": ["List of key operations like Seq Scan, Index Scan, etc."]
}}

Focus on:
1. Identifying expensive operations (Seq Scan, nested loops)
2. Missing indexes
3. Join strategies
4. Sorting and aggregation costs
5. Practical optimization suggestions

Return ONLY valid JSON, no markdown or extra text."""

    async def analyze_explain(self, query: str, explain_output: str) -> dict:
        """Analyze explain plan and return insights."""
        if not self.model:
            return {
                "success": False,
                "error": "Gemini API key not configured"
            }
        
        try:
            prompt = self._get_prompt(query, explain_output)
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": settings.GEMINI_TEMPERATURE,
                    "max_output_tokens": settings.GEMINI_MAX_TOKENS,
                }
            )
            
            # Parse JSON response
            result_text = response.text.strip()
            # Remove markdown code blocks if present
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
            
            analysis = json.loads(result_text.strip())
            
            return {
                "success": True,
                "analysis": analysis
            }
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"Failed to parse AI response: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Analysis failed: {str(e)}"
            }
