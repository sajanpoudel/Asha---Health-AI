export const readEmail = async (accessToken: string, query: string): Promise<string> => {
  try {
    const response = await fetch('/api/google/gmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, query }),
    });

    if (!response.ok) {
      throw new Error('Failed to read email');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error reading email:', error);
    return 'I encountered an error while trying to read your email. Could you please try again?';
  }
};
