import { useEffect } from "react";

export const useInstagramEmbed = () => {
    useEffect(() => {
        const loadScript = () => {
            if (document.querySelector('script[src="//www.instagram.com/embed.js"]')) {
                if ((window as any).instgrm) {
                    (window as any).instgrm.Embeds.process();
                }
                return;
            }

            const script = document.createElement("script");
            script.src = "//www.instagram.com/embed.js";
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                if ((window as any).instgrm) {
                    (window as any).instgrm.Embeds.process();
                }
            };
        };

        loadScript();
    }, []);

    const processEmbeds = () => {
        if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
        }
    };

    return { processEmbeds };
};
