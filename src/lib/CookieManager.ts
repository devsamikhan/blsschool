/**
 * CookieManager Utility
 * Lightweight helper to manage browser cookies without external dependencies.
 */

export const Cookies = {
  /**
   * Set a cookie
   * @param name Cookie name
   * @param value Cookie value
   * @param days Expiry in days (defaults to 30)
   */
  set(name: string, value: string, days: number = 30) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const cookieValue = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    document.cookie = cookieValue;
  },

  /**
   * Get a cookie value
   * @param name Cookie name
   * @returns value or null
   */
  get(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  },

  /**
   * Remove a cookie
   * @param name Cookie name
   */
  remove(name: string) {
    document.cookie = `${name}=; Max-Age=-99999999;path=/;SameSite=Lax`;
  }
};
