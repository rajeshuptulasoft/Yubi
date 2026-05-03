import { useEffect, useState } from "react";
import { foodAPI } from "../lib/api";
import { extractFoodCategoriesList } from "../lib/foodProductUtils";

/** GET /food/categories — uses same `API_BASE_URL` as the rest of the app (dev proxy + production). */
export function useFoodCategories() {
  const [names, setNames] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await foodAPI.getCategories();
        const list = extractFoodCategoriesList(res);
        if (!cancelled) {
          setNames(list);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setNames(null);
          setError(e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { names, loading, error };
}
