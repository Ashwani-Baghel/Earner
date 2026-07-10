import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const DEFAULT_SETTINGS = {
  websiteName: "Earner", websiteLogo: "", favicon: "", supportEmail: "", supportPhone: "", defaultCurrency: "USD", defaultTimezone: "UTC", maintenanceMode: false,
  enableGoogleLogin: true, enableLinkedinLogin: false, requireEmailVerification: true, allowBuyerRegistration: true, allowSellerRegistration: true,
  autoApproveSellers: false, requireSellerVerification: true, maxGigsPerSeller: 10, defaultUserRole: "BUYER",
  autoApproveGigs: true, minGigPrice: 5, maxGigPrice: 10000, maxImagesPerGig: 5, maxVideoSize: 50,
  platformCommission: 20, minWithdrawalAmount: 50, enableWithdrawals: true, paymentMode: "Test",
  emailNotifications: true, adminNotifications: true, buyerNotifications: true, sellerNotifications: true,
  enableRecaptcha: false, maxLoginAttempts: 5, sessionTimeout: 60, blockSuspendedUsers: true
};

export function useAdminSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setSettings((prev: any) => ({ ...prev, ...data }));
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setSettings((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === "number") {
      setSettings((prev: any) => ({ ...prev, [name]: Number(value) }));
    } else {
      setSettings((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, handleChange, handleSave };
}
