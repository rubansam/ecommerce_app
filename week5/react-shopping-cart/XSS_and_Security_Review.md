# XSS and Security Review for Product Component and CartProduct Component

## Issues Identified

1. **Image Source Validation**
   - The `sku` property was used directly to construct image URLs for product images in both the Product and CartProduct components.
   - If `sku` was not properly sanitized, this could allow path traversal or injection attacks if malicious data entered the system.

2. **Other Security Aspects**
   - No use of `dangerouslySetInnerHTML` or unsafe HTML rendering was found.
   - No direct user input or form handling in these components, so no input validation issues here.
   - No navigation or URL manipulation in these components.

## Changes Made

- **Sanitized the `sku` property** before using it to construct image URLs in both Product and CartProduct. Only digits are allowed, preventing path traversal or injection via the SKU.
- The sanitized value (`safeSku`) is now used for all image and container rendering in both components.

## Example of the Fix
```tsx
// Sanitize SKU to only allow digits (prevents path traversal or injection)
const safeSku = typeof sku === 'number' ? sku : String(sku).replace(/[^0-9]/g, '');

// In Product:
<S.Container sku={safeSku} ...>
  <S.Image ... />
</S.Container>

// In CartProduct:
<S.Image src={require(`static/products/${safeSku}-1-cart.webp`)} ... />
```

## Summary Table
| Area                     | Status/Action Taken                                      |
|--------------------------|---------------------------------------------------------|
| XSS vulnerabilities      | No direct issues found                                  |
| Unsafe HTML rendering    | No use of dangerouslySetInnerHTML                       |
| Input validation         | Not applicable (no user input in these components)       |
| URL/navigation security  | Not applicable (no navigation in these components)       |
| Image source validation  | **Sanitized SKU before use in image URLs**               |

## Recommendation
- Always sanitize and validate any data used in URLs or rendered as HTML, especially if it could come from user input or external sources. 