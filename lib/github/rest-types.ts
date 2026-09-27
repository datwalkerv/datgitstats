export interface RestUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  created_at: string;
  followers: number;
  following: number;
  public_repos: number;
  type: string;
}

export interface RestRepo {
  name: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
  stargazers_count: number;
  size: number;
  language: string | null;
}

export interface RestSearch {
  total_count: number;
}
