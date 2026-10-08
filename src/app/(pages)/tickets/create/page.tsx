import PageHeader from "@components/modules/page-header";
import { Button } from "@components/ui/button";
import CreateTicket from "@features/ticket/Create";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const CreateTicketPage = () => {
  return (
    <>
      <PageHeader
        title="Create Ticket"
        description="Create and submit a new support ticket."
        actions={
          <Button variant="ghost" className="px-2" asChild>
            <Link href="/tickets">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <CreateTicket />
    </>
  );
};

export default CreateTicketPage;
