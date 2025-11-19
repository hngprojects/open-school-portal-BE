export interface RevokeAllSessionsData {
  revoked_count: number;
}

export interface RevokeSessionData {
  revoked: boolean;
  session_id: string;
}

export interface CreateSessionData {
  session_id: string;
  expires_at: Date;
}
