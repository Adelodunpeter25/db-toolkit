export function createHoneypot() {
  const startTime = Date.now();

  return {
    validate: (username, phone) => {
      const elapsed = Date.now() - startTime;
      
      if (username || phone) {
        return { valid: false, reason: 'Bot detected' };
      }
      
      if (elapsed < 3000) {
        return { valid: false, reason: 'Submitted too quickly' };
      }
      
      return { valid: true };
    }
  };
}
