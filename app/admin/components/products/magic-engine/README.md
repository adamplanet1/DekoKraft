# Magic Engine UI

`../magicEnginePreview.ts` builds and calculates the Magic Engine preview state.

Components in this folder are presentational UI only. They should receive props from `ProductModal.tsx` and should not calculate product state.

`types.ts` contains shared Magic Engine types.

`ui.tsx` contains shared UI primitives used by the cards.

`index.ts` exports the Magic Engine UI components.

`ProductModal.tsx` should compose these components and pass localized text, calculated values, and display props into them.

Do not put backend, AI, or saving logic inside Magic Engine UI components.
