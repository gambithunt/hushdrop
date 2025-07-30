import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const audioFile = formData.get('audio') as File;
		
		if (!audioFile) {
			return json({ error: 'No audio file provided' }, { status: 400 });
		}
		
		// Create a new FormData to send to the backend server
		const backendFormData = new FormData();
		backendFormData.append('audio', audioFile);
		
		// Forward the request to the backend server
		const response = await fetch('http://localhost:3001/analyze', {
			method: 'POST',
			body: backendFormData
		});
		
		if (!response.ok) {
			throw new Error(`Backend server error: ${response.status}`);
		}
		
		const result = await response.json();
		return json(result);
		
	} catch (error) {
		console.error('Analysis error:', error);
		return json(
			{ error: 'Failed to analyze audio file' }, 
			{ status: 500 }
		);
	}
};