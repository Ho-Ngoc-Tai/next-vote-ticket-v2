"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Spinner } from "@components/ui/spinner";
import { LOADING_STATUS } from "@constants/status";
import type { TicketDetail } from "@interfaces/tickets";
import { WEB_TICKET_DETAIL_ENDPOINT } from "@routes/web";
import { useAppDispatch, useAppSelector } from "@stores/index";
import {
  getTicketDetailAction,
  ticketDetailSelector,
  updateTicketAction,
  updateTicketSelector,
} from "@stores/reducers/tickets";
import { makeUpload, uploadAction } from "@stores/reducers/upload";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TicketForm } from "../components/TicketForm";
import type { TicketFormData } from "../components/TicketForm/types";

const mapTicketDetailToDefaultValues = (data: TicketDetail) => ({
  subject: data.subject ?? "",
  category: data.categoryTitle ?? "",
  description: data.description ?? "<p></p>",
  tags: [],
  attachments: data.attachments ?? [],
  customerInfo: data.customer
    ? {
        name: data.customer.name ?? "",
        email: data.customer.email ?? "",
        phone: data.customer.phone ?? "",
      }
    : { name: "", email: "", phone: "" },
});

export default function EditTicketManagement({ id }: { id: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, params, status, error } = useAppSelector(ticketDetailSelector);
  const updateTicket = useAppSelector(updateTicketSelector);
  const uploadState = useAppSelector(makeUpload);
  const [isUploading, setIsUploading] = useState(false);

  const pendingTicketDataRef = useRef<{
    id: string;
    subject: string;
    category: string;
    description: string;
    tags: string[];
    customerInfo: { name: string; email: string; phone: string };
  } | null>(null);

  useEffect(() => {
    if (!id || id === "undefined") return;
    if (params?.id === id && (status === LOADING_STATUS.LOADING || status === LOADING_STATUS.SUCCESS)) return;
    dispatch(getTicketDetailAction({ id }));
  }, [id, params?.id, status, dispatch]);

  useEffect(() => {
    if (isUploading && uploadState.upload.status === LOADING_STATUS.SUCCESS) {
      const pending = pendingTicketDataRef.current;
      if (pending) {
        const ticketData = {
          ...pending,
          attachments: uploadState.upload.data || [],
        };
        dispatch(updateTicketAction(ticketData as any));
      }
      pendingTicketDataRef.current = null;
      queueMicrotask(() => setIsUploading(false));
    } else if (isUploading && uploadState.upload.status === LOADING_STATUS.ERROR) {
      pendingTicketDataRef.current = null;
      queueMicrotask(() => setIsUploading(false));
    }
  }, [uploadState.upload.status, isUploading, dispatch]);

  useEffect(() => {
    if (updateTicket.status === LOADING_STATUS.SUCCESS) {
      router.push(WEB_TICKET_DETAIL_ENDPOINT(id));
    }
  }, [updateTicket.status, router, id]);

  const handleSubmit = (formData: TicketFormData & { newFiles?: File[] }) => {
    const { newFiles, tags, ...rest } = formData;
    const baseTicketData = {
      id,
      ...rest,
      attachments: (rest.attachments ?? []) as string[],
    };

    if (newFiles && newFiles.length > 0) {
      pendingTicketDataRef.current = {
        id,
        subject: baseTicketData.subject,
        category: baseTicketData.category,
        description: baseTicketData.description,
        tags: tags ?? [],
        customerInfo: baseTicketData.customerInfo,
      };
      const formDataUpload = new FormData();
      newFiles.forEach((file) => formDataUpload.append("files", file));
      formDataUpload.append("source", "ticket");
      setIsUploading(true);
      dispatch(uploadAction(formDataUpload));
    } else {
      dispatch(updateTicketAction({ ...baseTicketData, tags } as any));
    }
  };

  if (status === LOADING_STATUS.LOADING || !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (status === LOADING_STATUS.ERROR) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-destructive">Failed to load ticket.</p>
          {error ? (
            <pre className="mt-4 text-left text-xs opacity-70 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
          ) : null}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => dispatch(getTicketDetailAction({ id }))}
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const defaultValues = mapTicketDetailToDefaultValues(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <TicketForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push(WEB_TICKET_DETAIL_ENDPOINT(id))}
          isLoading={updateTicket.status === LOADING_STATUS.LOADING || isUploading}
          isSuccess={updateTicket.status === LOADING_STATUS.SUCCESS}
          uploadError={
            uploadState.upload.status === LOADING_STATUS.ERROR ? "Upload failed. Please try again." : undefined
          }
        />
      </CardContent>
    </Card>
  );
}
