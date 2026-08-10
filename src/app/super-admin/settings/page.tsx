import { redirect } from "next/navigation";

export default function SettingsIndex() {
  redirect("/super-admin/settings/general");
}
