export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          avatar_url: string | null;
          email: string | null;
          role: "user" | "admin";
        } & Timestamps;
        Insert: {
          id: string;
          nickname: string;
          avatar_url?: string | null;
          email?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nickname?: string;
          avatar_url?: string | null;
          email?: string | null;
          role?: "user" | "admin";
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_scriptures: {
        Row: {
          id: string;
          scripture_date: string;
          bible_book: string;
          chapter: number;
          verse: string;
          bible_text: string;
          focus_verse: string;
          qt_question_1: string;
          qt_question_2: string;
          qt_question_3: string;
          prayer_question: string;
          created_by: string | null;
          scheduled_at: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          scripture_date: string;
          bible_book: string;
          chapter: number;
          verse: string;
          bible_text: string;
          focus_verse: string;
          qt_question_1: string;
          qt_question_2: string;
          qt_question_3: string;
          prayer_question: string;
          created_by?: string | null;
          scheduled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_scriptures"]["Insert"]>;
        Relationships: [];
      };
      qt_entries: {
        Row: {
          id: string;
          user_id: string;
          daily_scripture_id: string;
          status: "draft" | "completed";
          completed_at: string | null;
          word_count: number;
        } & Timestamps;
        Insert: {
          id?: string;
          user_id: string;
          daily_scripture_id: string;
          status?: "draft" | "completed";
          completed_at?: string | null;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "draft" | "completed";
          completed_at?: string | null;
          word_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      qt_answers: {
        Row: {
          id: string;
          qt_entry_id: string;
          question_key: "heart_verse" | "message" | "practice" | "prayer";
          answer_text: string;
        } & Timestamps;
        Insert: {
          id?: string;
          qt_entry_id: string;
          question_key: "heart_verse" | "message" | "practice" | "prayer";
          answer_text?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          answer_text?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      qt_mates: {
        Row: {
          id: string;
          requester_id: string;
          receiver_id: string | null;
          invite_token: string;
          status: "pending" | "accepted" | "ended";
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          receiver_id?: string | null;
          invite_token?: string;
          status?: "pending" | "accepted" | "ended";
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          receiver_id?: string | null;
          status?: "pending" | "accepted" | "ended";
          accepted_at?: string | null;
        };
        Relationships: [];
      };
      qt_schedules: {
        Row: {
          id: string;
          qt_mate_id: string;
          weekday: number;
          created_at: string;
        };
        Insert: { id?: string; qt_mate_id: string; weekday: number; created_at?: string };
        Update: { weekday?: number };
        Relationships: [];
      };
      qt_reactions: {
        Row: {
          id: string;
          qt_entry_id: string;
          user_id: string;
          reaction_type: "amen" | "pray" | "heart";
          created_at: string;
        };
        Insert: {
          id?: string;
          qt_entry_id: string;
          user_id: string;
          reaction_type: "amen" | "pray" | "heart";
          created_at?: string;
        };
        Update: { reaction_type?: "amen" | "pray" | "heart" };
        Relationships: [];
      };
      qt_comments: {
        Row: {
          id: string;
          qt_entry_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: { id?: string; qt_entry_id: string; user_id: string; body: string; created_at?: string };
        Update: { body?: string };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string | null;
          type: "mate_completed" | "mate_accepted" | "reaction" | "comment" | "qt_day" | "streak";
          payload: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id?: string | null;
          type: "mate_completed" | "mate_accepted" | "reaction" | "comment" | "qt_day" | "streak";
          payload?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: { read_at?: string | null };
        Relationships: [];
      };
      aquarium_progress: {
        Row: {
          user_id: string;
          total_qt_count: number;
          current_streak: number;
          mate_qt_count: number;
          unlocked_items: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_qt_count?: number;
          current_streak?: number;
          mate_qt_count?: number;
          unlocked_items?: Json;
          updated_at?: string;
        };
        Update: {
          total_qt_count?: number;
          current_streak?: number;
          mate_qt_count?: number;
          unlocked_items?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_invite: {
        Args: { token: string };
        Returns: { requester_nickname: string; status: string; is_self: boolean }[];
      };
      accept_invite: {
        Args: { token: string };
        Returns: Database["public"]["Tables"]["qt_mates"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
