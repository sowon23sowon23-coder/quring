export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

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
          created_at: string;
          updated_at: string;
        };
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
          created_at: string;
          updated_at: string;
        };
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
        Update: {
          scripture_date?: string;
          bible_book?: string;
          chapter?: number;
          verse?: string;
          bible_text?: string;
          focus_verse?: string;
          qt_question_1?: string;
          qt_question_2?: string;
          qt_question_3?: string;
          prayer_question?: string;
          created_by?: string | null;
          scheduled_at?: string | null;
          updated_at?: string;
        };
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
          created_at: string;
          updated_at: string;
        };
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
          created_at: string;
          updated_at: string;
        };
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
