# Learning lab maintenance

- Public educational site only. Do not copy personal career, employer, finance or private dashboard data.
- Keep the first lesson runnable with synthetic data and no GPU or paid API.
- Add terminology in the order it is used; teach with observable changes and small experiments.
- Follow the user's `write-reader-first` skill for lesson writing and revision. Use headings that name the content or activity, not conclusions that require the lesson to understand. Introduce symbols and terms before they appear in controls or diagrams; place general conclusions after concrete examples and observations.
- Preserve stable completion keys. Never infer completion from clicks or time spent.
- Validate numerical changes with `node tests/model.test.cjs`; verify interaction and narrow-screen layout for UI changes.
- Publish only `site/`. Source of truth is this repository; no generated personal dashboard HTML.
