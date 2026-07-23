---
'@crawfordyoung/ui': patch
---

FormDialog renders `noValidate` on its internal form — the shell owns custom-controlled validation; native constraint validation no longer pre-empts in-form error rendering.
