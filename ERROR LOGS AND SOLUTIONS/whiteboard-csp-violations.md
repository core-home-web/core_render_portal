# Whiteboard CSP Violations Error

## Error Description

The whiteboard crashes when trying to make changes due to Content Security Policy (CSP) violations. The browser console shows multiple errors:

1. **Translation loading blocked:**
   ```
   Refused to connect to 'https://cdn.tldraw.com/4.2.1/translations/en.json' 
   because it violates the following Content Security Policy directive: 
   "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com"
   ```

2. **Watermark tracking blocked:**
   ```
   Refused to connect to 'https://cdn.tldraw.com/4.2.1/watermarks/watermark-track.svg?...' 
   because it violates the following Content Security Policy directive: "connect-src ..."
   ```

3. **Font loading blocked:**
   ```
   Refused to load the font '<URL>' because it violates the following 
   Content Security Policy directive: "font-src 'self' https://fonts.gstatic.com data:"
   ```

4. **Vercel Live script blocked (development only):**
   ```
   Refused to load the script 'https://vercel.live/_next-live/feedback/feedback.js' 
   because it violates the following Content Security Policy directive: "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
   ```

## Root Cause

The Content Security Policy in `next.config.js` was missing required domains for tldraw's CDN:
- `https://cdn.tldraw.com` was not included in `connect-src` directive
- `https://cdn.tldraw.com` was not included in `font-src` directive
- `https://vercel.live` was not included in `script-src` directive (development only)

## Solution

Updated the CSP headers in `next.config.js` to include:

1. **connect-src**: Added `https://cdn.tldraw.com` to allow:
   - Translation file loading (`/translations/en.json`)
   - Watermark tracking requests
   - Other API calls from tldraw

2. **font-src**: Added `https://cdn.tldraw.com` to allow:
   - Font files required by tldraw

3. **script-src** (development only): Added `https://vercel.live` to allow:
   - Vercel Live feedback script

## Files Modified

- `next.config.js` - Updated CSP headers for both development and production

## Code Changes

### Before:
```javascript
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com data:
script-src 'self' 'unsafe-eval' 'unsafe-inline'
```

### After:
```javascript
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com https://cdn.tldraw.com
font-src 'self' https://fonts.gstatic.com https://cdn.tldraw.com data:
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live  // dev only
```

## Testing

After deploying the fix:
1. Open the whiteboard
2. Try making changes (draw, add shapes, etc.)
3. Check browser console - should see no CSP violations
4. Whiteboard should work without crashes

## Related Issues

- This error occurred after adding tldraw whiteboard functionality
- The CSP was previously configured for Supabase and Google Fonts only
- tldraw requires external CDN resources that weren't accounted for

## Additional Notes

- **tldraw License Warning**: The console also shows a warning about missing tldraw license key for production. This is separate from the CSP issue and doesn't cause crashes, but should be addressed for production deployments by purchasing a license from sales@tldraw.com

## Date Fixed

2025-01-XX (to be updated after deployment)

