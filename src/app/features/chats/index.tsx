"use client";

import socketService from "@services/socket-service";
import { useAppDispatch, useAppSelector } from "@stores/index";
import { getConversationsAction, mapConversationsSelector } from "@stores/reducers/chat";
import { useEffect, useMemo } from "react";
import { Chat } from "./Chat";

const Chats = () => {
  const dispatch = useAppDispatch();
  const mapConversations = useAppSelector(mapConversationsSelector);

  const conversations = useMemo(() => {
    return Object.values(mapConversations);
  }, [mapConversations]);

  useEffect(() => {
    dispatch(getConversationsAction({ page: 1, limit: 20 }));
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  return <Chat conversations={Array.isArray(conversations) ? conversations : []} />;
};

export default Chats;
