---
'@crawfordyoung/ui': patch
---

`SplitText`'s accessible-name mechanism switched from a prohibited `aria-label` on the wrapper span to an `sr-only` text child — fixes axe `aria-prohibited-attr` on every consumer (`aria-label` is not permitted on a role-less generic `<span>`).
