import { cookies } from "next/headers";
import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";
import fr from "./dictionaries/fr.json";

type Locale = "en" | "es" | "fr";

const dictionaries: Record<Locale, any> = { en, es, fr };

const getNestedObject = (obj: any, path: string): string => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

export async function getTranslation() {
    const cookieStore = await cookies();
    const raw = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
    const locale: Locale = (["en", "es", "fr"] as Locale[]).includes(raw as Locale)
        ? (raw as Locale)
        : "en";

    const dict = dictionaries[locale];

    const t = (key: string, vars?: Record<string, string | number>): string => {
        let value: string = getNestedObject(dict, key) ?? key;
        if (vars) {
            Object.entries(vars).forEach(([k, v]) => {
                value = value.replace(`{{${k}}}`, String(v));
            });
        }
        return value;
    };

    return { t, locale };
}
