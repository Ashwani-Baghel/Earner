import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useCmsSettings<T>(key: string, defaultSettings: T) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<T>(defaultSettings);

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/admin/cms/config?key=${key}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const fetchedData = await res.json();
          setData((prev) => ({ ...prev, ...fetchedData }));
        }
      } catch (error) {
        toast.error("Failed to load CMS config");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user, key]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === "number") {
      setData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const setField = (name: keyof T, value: any) => {
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/cms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key, data })
      });
      if (res.ok) {
        toast.success("Saved successfully!");
        router.refresh(); // Invalidate client-side router cache so layout re-fetches
      } else {
        toast.error("Failed to save changes");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return { data, setData, loading, saving, handleChange, setField, handleSave };
}
