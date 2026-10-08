import PageHeader from "@components/modules/page-header";
import { Button } from "@components/ui/button";
import EditTicketManagement from "@features/ticket/Edit";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <PageHeader
        title="Edit Ticket"
        description="Update ticket information."
        actions={
          <Button variant="ghost" className="px-2" asChild>
            <Link href={`/tickets/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <EditTicketManagement id={id} />
    </>
  );
}
