import { revalidateTag } from "next/cache";
try {
  revalidateTag('test', 'max');
  console.log("Success");
} catch (e) {
  console.error("Failed:", e);
}
