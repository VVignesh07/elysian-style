import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Handle Vite dynamic import errors (e.g., when a new version is deployed and old chunks are missing)
window.addEventListener('vite:preloadError', (event) => {
    // Prevent the default application error
    event.preventDefault();
    // Reload the page to get the latest index.html and fresh chunks
    window.location.reload();
});

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <App />
    </HelmetProvider>
);
