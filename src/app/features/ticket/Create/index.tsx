"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@stores/index";
import { createTicketAction, createTicketSelector, getTicketsAction } from "@stores/reducers/tickets";
import { uploadAction, makeUpload } from "@stores/reducers/upload";
import { LOADING_STATUS } from "@constants/status";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { TicketForm } from "../components/TicketForm";
import type { TicketFormData } from "../components/TicketForm/types";

export default function CreateTicketManagement() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const createTicket = useAppSelector(createTicketSelector);
  const uploadState = useAppSelector(makeUpload);
  const [isUploading, setIsUploading] = useState(false);

  const pendingTicketDataRef = useRef<{
    subject: string;
    category: string;
    description: string;
    hashtags: string[];
    customerInfo: { name: string; email: string; phone: string };
  } | null>(null);

  useEffect(() => {
    if (isUploading && uploadState.upload.status === LOADING_STATUS.SUCCESS) {
      const pending = pendingTicketDataRef.current;
      if (pending) {
        const ticketData = {
          ...pending,
          attachments: uploadState.upload.data || [],
        };
        dispatch(createTicketAction(ticketData as any));
      }
      pendingTicketDataRef.current = null;
      queueMicrotask(() => setIsUploading(false));
    } else if (isUploading && uploadState.upload.status === LOADING_STATUS.ERROR) {
      pendingTicketDataRef.current = null;
      queueMicrotask(() => setIsUploading(false));
    }
  }, [uploadState.upload.status, isUploading, dispatch]);

  useEffect(() => {
    if (createTicket.status === LOADING_STATUS.SUCCESS) {
      dispatch(getTicketsAction({}));
      router.push("/tickets");
    }
  }, [createTicket.status, router, dispatch]);

  const handleSubmit = (data: TicketFormData & { newFiles?: File[] }) => {
    const { newFiles, tags, ...rest } = data;
    const baseTicketData = {
      ...rest,
      attachments: [] as string[],
    };

    if (newFiles && newFiles.length > 0) {
      pendingTicketDataRef.current = {
        subject: baseTicketData.subject,
        category: baseTicketData.category,
        description: baseTicketData.description,
        hashtags: tags ?? [],
        customerInfo: baseTicketData.customerInfo,
      };
      const formDataUpload = new FormData();
      newFiles.forEach((file) => formDataUpload.append("files", file));
      formDataUpload.append("source", "ticket");
      setIsUploading(true);
      dispatch(uploadAction(formDataUpload));
    } else {
      dispatch(createTicketAction({ ...baseTicketData, hashtags: tags }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Information</CardTitle>
      </CardHeader>
      <CardContent>
        <TicketForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.push("/tickets")}
          isLoading={createTicket.status === LOADING_STATUS.LOADING || isUploading}
          isSuccess={createTicket.status === LOADING_STATUS.SUCCESS}
          uploadError={
            uploadState.upload.status === LOADING_STATUS.ERROR ? "Upload failed. Please try again." : undefined
          }
        />
      </CardContent>
    </Card>
  );
}
