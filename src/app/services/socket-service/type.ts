export interface SubscribeBody<T> {
  topicKey: string;
  topicType: string;
  params?: T;
  token?: string;
}

export interface SubscribeResponse {
  code: number;
  message: string;
  success: boolean;
  topicKey: string;
  topicName: string;
}
