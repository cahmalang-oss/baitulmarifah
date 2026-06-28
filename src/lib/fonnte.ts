export async function sendWA(to: string, message: string): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN;
  
  if (!token || token === 'placeholder') {
    console.warn(`[Fonnte Dev Mode] Sending WA to ${to}:\n${message}`);
    return true;
  }

  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: new URLSearchParams({
        target: to,
        message: message,
      })
    });
    
    const data = await res.json();
    return data.status === true;
  } catch (err) {
    console.error('Fonnte Error:', err);
    return false;
  }
}
