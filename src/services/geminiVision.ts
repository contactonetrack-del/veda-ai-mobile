/**
 * Gemini Vision API Service
 * SECURE: Uses backend proxy instead of direct API calls.
 * API key is protected on server, not exposed in mobile bundle.
 */

// Production backend URL (same as website)
const API_BASE_URL = 'https://veda-ai-backend-ql2b.onrender.com';

interface FoodItem {
    name: string;
    nameHindi: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface VisionAnalysisResult {
    foods: FoodItem[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    healthTips: string;
    success: boolean;
    error?: string;
    rateLimitRemaining?: number;
}

/**
 * Analyze food image using secure backend proxy.
 * Rate Limited: 5 requests per hour per IP.
 */
export async function analyzeThaliImage(base64Image: string): Promise<VisionAnalysisResult> {
    try {
        console.log('[VEDA] Calling Vision API via backend proxy...');

        const response = await fetch(`${API_BASE_URL}/api/v1/vision/analyze-food`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64Image })
        });

        console.log('[VEDA] API Response status:', response.status);

        // Handle rate limiting
        if (response.status === 429) {
            const error = await response.json();
            return {
                foods: [],
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0,
                healthTips: '',
                success: false,
                error: error.detail?.message || '⏳ Rate limit exceeded. You can analyze 5 images per hour.'
            };
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform backend response to match expected format
        return {
            foods: data.foods?.map((f: any) => ({
                name: f.name,
                nameHindi: f.name_hindi || '',
                portion: '1 serving',
                calories: f.calories,
                protein: f.protein,
                carbs: f.carbs,
                fat: f.fat
            })) || [],
            totalCalories: data.total_calories || 0,
            totalProtein: data.total_protein || 0,
            totalCarbs: data.total_carbs || 0,
            totalFat: data.total_fat || 0,
            healthTips: data.health_tips?.join(' ') || '',
            success: true,
            rateLimitRemaining: data.rate_limit_remaining
        };
    } catch (error: any) {
        console.error('[VEDA-ERROR] Vision API:', error);
        return {
            foods: [],
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            healthTips: '',
            success: false,
            error: error.message || 'Failed to analyze image. Please try again.'
        };
    }
}
