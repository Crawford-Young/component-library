---
'@crawfordyoung/ui': patch
---

`TaskTimeFields` now accepts optional `repeatMin` (default `1`) and `repeatMax` (default unbounded) props, forwarded to the repeat-count input so consumers can constrain the recurrence count to their own range.
