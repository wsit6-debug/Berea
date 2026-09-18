---
description: Constraints for matching and highlighting biblical characters in text
---

# Character Highlighting & Data Matching Rules

When implementing logic to match, parse, or highlight biblical characters from text data, you **must** adhere to the following constraints to prevent false positives:

1. **Case-Sensitivity is Required**: Never use case-insensitive matching (`/gi`) for biblical names. Always use case-sensitive matching (`/g`) to prevent common lowercase English words (e.g., "put", "mark", "job", "will", "so") from being falsely highlighted as biblical characters.
2. **Explicit Filtering of False Positives**: Even with case-sensitive matching, some obscure names overlap with common words that may be capitalized at the beginning of a sentence. You must implement and maintain an explicit `IGNORED_NAMES` exclusion list for:
   - Common English words (e.g., "Put", "So", "On", "No", "Do", "As", "Let", "Us", "Or", "Are", "Will", "Some", "All", "Any").
   - Geographic locations that might be confused as characters (e.g., "Jordan", "Egypt").
3. **Location Exclusion**: Never confuse or highlight geographic locations as character biographies. Verify against the application's geo-data if necessary.
