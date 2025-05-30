const API_BASE_URL = '/api';

export async function apiRequest(
	endpoint: string,
	method: string = 'GET',
	body?: object,
) {
	const options: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	};
	if (body) {
		options.body = JSON.stringify(body);
	}
	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ message: response.statusText }));
			const error: any = new Error(errorData.message || response.statusText);
			error.status = response.status;
			console.error(`API Error ${response.status} for ${method} ${endpoint}:`, errorData.message);
			throw error;
		}
		if (
			response.status === 204 ||
			response.headers.get('content-length') === '0'
		) {
			return null;
		}
		return await response.json();
	} catch (error) {
		console.error(
			`Network or parsing error for ${method} ${endpoint}:`,
			error,
		);
		throw error;
	}
}

export async function register(username: string, password: string): Promise<{ user: { id: number; username: string } }> {
    return apiRequest('/auth/register', 'POST', { username, password });
}

export async function login(username: string, password: string): Promise<{ user: { id: number; username: string } }> {
    return apiRequest('/auth/login', 'POST', { username, password });
}

export async function logout(): Promise<void> {
    await apiRequest('/auth/logout', 'POST');
}

export async function getMe(): Promise<{ user: { id: number; username: string } } | null> {
    try {
        return await apiRequest('/auth/me');
    } catch (error: any) {
        if (error.message.includes('401') || error.message.includes('Пользователь не аутентифицирован')) {
            return null; 
        }
        throw error; 
    }
}

export async function getLevels(): Promise<any[]> { 
    return apiRequest('/levels') || [];
}

export async function startAttempt(levelId: string): Promise<{ attemptId: number }> {
    return apiRequest('/game/start_attempt', 'POST', { levelId });
}

export async function completeLevel(payload: {levelId: string; bestTimeMs?: number; finalLength: number;}): Promise<void> {
    return apiRequest('/game/complete_level', 'POST', payload);
}

export async function getAdminOverallStats(): Promise<any> {
    return apiRequest('/admin/stats/overall');
}

export async function getAdminUsersStats(): Promise<any[]> {
    return apiRequest('/admin/stats/users');
}

export async function getAdminLevelsStats(): Promise<any[]> {
    return apiRequest('/admin/stats/levels');
}