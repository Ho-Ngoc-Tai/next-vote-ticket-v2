export interface UserInfo {
  fullname: string;
  username: string;
  email: string;
  is_active: number;
  role: string[];
  nickname: string;
  displayName: string;
  deletedAt: string | null;
  deletedBy: string | null;
  is_verify: boolean;
  ref_code: string;
  invited_by: string | null;
  user_agent: string;
  ip_address: string;
  createdAt: string;
  updatedAt: string;
  avatar: string;
  birthdate: string;
  cover: string;
  gender: string;
  phone: string;
  id: string;
}
