import { WEB_TICKET_ENDPOINT } from "@routes/web";
import { redirect } from "next/navigation";

const Page = () => {
  redirect(WEB_TICKET_ENDPOINT);
};

export default Page;
