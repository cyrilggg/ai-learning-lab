# Learning lab maintenance

- Public educational site only. Do not copy personal career, employer, finance or private dashboard data.
- Keep the first lesson runnable with synthetic data and no GPU or paid API.
- Add terminology in the order it is used; teach with observable changes and small experiments.
- Preserve stable completion keys. Never infer completion from clicks or time spent.
- Validate numerical changes with `node tests/model.test.cjs`; verify interaction and narrow-screen layout for UI changes.
- Publish only `site/`. Source of truth is this repository; no generated personal dashboard HTML.
