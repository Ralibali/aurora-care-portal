export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      billing_state: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string
          id: string
          is_demo: boolean
          mrr_sek: number
          organization_id: string
          plan_id: string | null
          renewal_date: string | null
          site_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id: string
          id?: string
          is_demo?: boolean
          mrr_sek?: number
          organization_id: string
          plan_id?: string | null
          renewal_date?: string | null
          site_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string
          id?: string
          is_demo?: boolean
          mrr_sek?: number
          organization_id?: string
          plan_id?: string | null
          renewal_date?: string | null
          site_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_state_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_state_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_state_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_state_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_demo: boolean
          name: string
          notes: string | null
          organization_id: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          name: string
          notes?: string | null
          organization_id: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          name?: string
          notes?: string | null
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_demo: boolean
          opened_at: string
          organization_id: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          site_id: string
          status: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_demo?: boolean
          opened_at?: string
          organization_id: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          site_id: string
          status?: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_demo?: boolean
          opened_at?: string
          organization_id?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          site_id?: string
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          base_url: string | null
          created_at: string
          id: string
          label: string
          last_sync_at: string | null
          last_test_at: string | null
          last_test_message: string | null
          mode: Database["public"]["Enums"]["connection_mode"]
          notes: string | null
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          created_at?: string
          id?: string
          label: string
          last_sync_at?: string | null
          last_test_at?: string | null
          last_test_message?: string | null
          mode?: Database["public"]["Enums"]["connection_mode"]
          notes?: string | null
          provider?: string
          status?: string
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          created_at?: string
          id?: string
          label?: string
          last_sync_at?: string | null
          last_test_at?: string | null
          last_test_message?: string | null
          mode?: Database["public"]["Enums"]["connection_mode"]
          notes?: string | null
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          company: string | null
          contact_name: string
          created_at: string
          email: string
          id: string
          message: string | null
          phone: string | null
          plan_slug: string | null
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          company?: string | null
          contact_name: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          phone?: string | null
          plan_slug?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          company?: string | null
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          phone?: string | null
          plan_slug?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      maintenance_events: {
        Row: {
          created_at: string
          detail: string | null
          event_type: string
          id: string
          is_demo: boolean
          occurred_at: string
          organization_id: string
          site_id: string
          source: string
          title: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          event_type: string
          id?: string
          is_demo?: boolean
          occurred_at?: string
          organization_id: string
          site_id: string
          source?: string
          title: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          event_type?: string
          id?: string
          is_demo?: boolean
          occurred_at?: string
          organization_id?: string
          site_id?: string
          source?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          is_provider: boolean
          name: string
          org_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          is_provider?: boolean
          name: string
          org_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          is_provider?: boolean
          name?: string
          org_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          price_sek_monthly: number
          slug: string
          sort_order: number
          stripe_price_id: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          price_sek_monthly?: number
          slug: string
          sort_order?: number
          stripe_price_id?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price_sek_monthly?: number
          slug?: string
          sort_order?: number
          stripe_price_id?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          backups_completed: number
          created_at: string
          id: string
          incidents_count: number
          is_demo: boolean
          next_actions: string | null
          organization_id: string
          performance_notes: string | null
          period_month: string
          security_notes: string | null
          sent_at: string | null
          site_id: string
          status: Database["public"]["Enums"]["report_status"]
          summary: string | null
          updated_at: string
          updates_applied: number
          uptime_pct: number | null
        }
        Insert: {
          backups_completed?: number
          created_at?: string
          id?: string
          incidents_count?: number
          is_demo?: boolean
          next_actions?: string | null
          organization_id: string
          performance_notes?: string | null
          period_month: string
          security_notes?: string | null
          sent_at?: string | null
          site_id: string
          status?: Database["public"]["Enums"]["report_status"]
          summary?: string | null
          updated_at?: string
          updates_applied?: number
          uptime_pct?: number | null
        }
        Update: {
          backups_completed?: number
          created_at?: string
          id?: string
          incidents_count?: number
          is_demo?: boolean
          next_actions?: string | null
          organization_id?: string
          performance_notes?: string | null
          period_month?: string
          security_notes?: string | null
          sent_at?: string | null
          site_id?: string
          status?: Database["public"]["Enums"]["report_status"]
          summary?: string | null
          updated_at?: string
          updates_applied?: number
          uptime_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          customer_id: string
          domain: string
          health: Database["public"]["Enums"]["health_status"]
          id: string
          is_demo: boolean
          last_backup_at: string | null
          last_sync_at: string | null
          name: string
          onboarding_checklist: Json
          organization_id: string
          pending_updates: number
          performance_score: number | null
          php_version: string | null
          plan_id: string | null
          security_findings: number
          ssl_expires_at: string | null
          status: Database["public"]["Enums"]["site_status"]
          updated_at: string
          uptime_30d: number | null
          wp_admin_url: string | null
          wp_version: string | null
          wpmgr_enrollment_id: string | null
          wpmgr_site_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          domain: string
          health?: Database["public"]["Enums"]["health_status"]
          id?: string
          is_demo?: boolean
          last_backup_at?: string | null
          last_sync_at?: string | null
          name: string
          onboarding_checklist?: Json
          organization_id: string
          pending_updates?: number
          performance_score?: number | null
          php_version?: string | null
          plan_id?: string | null
          security_findings?: number
          ssl_expires_at?: string | null
          status?: Database["public"]["Enums"]["site_status"]
          updated_at?: string
          uptime_30d?: number | null
          wp_admin_url?: string | null
          wp_version?: string | null
          wpmgr_enrollment_id?: string | null
          wpmgr_site_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          domain?: string
          health?: Database["public"]["Enums"]["health_status"]
          id?: string
          is_demo?: boolean
          last_backup_at?: string | null
          last_sync_at?: string | null
          name?: string
          onboarding_checklist?: Json
          organization_id?: string
          pending_updates?: number
          performance_score?: number | null
          php_version?: string | null
          plan_id?: string | null
          security_findings?: number
          ssl_expires_at?: string | null
          status?: Database["public"]["Enums"]["site_status"]
          updated_at?: string
          uptime_30d?: number | null
          wp_admin_url?: string | null
          wp_version?: string | null
          wpmgr_enrollment_id?: string | null
          wpmgr_site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_requests: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_demo: boolean
          message: string
          organization_id: string
          priority: Database["public"]["Enums"]["incident_severity"]
          site_id: string | null
          status: Database["public"]["Enums"]["support_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_demo?: boolean
          message: string
          organization_id: string
          priority?: Database["public"]["Enums"]["incident_severity"]
          site_id?: string | null
          status?: Database["public"]["Enums"]["support_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_demo?: boolean
          message?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["incident_severity"]
          site_id?: string | null
          status?: Database["public"]["Enums"]["support_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_requests_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_org_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
      connection_mode: "demo" | "live"
      health_status: "healthy" | "attention" | "critical" | "unknown"
      incident_severity: "low" | "medium" | "high" | "critical"
      incident_status: "open" | "investigating" | "resolved"
      lead_status: "new" | "contacted" | "won" | "lost"
      report_status: "draft" | "ready" | "sent" | "overdue"
      site_status: "active" | "paused" | "onboarding" | "offboarded"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "pending"
      support_status: "new" | "in_progress" | "answered" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client"],
      connection_mode: ["demo", "live"],
      health_status: ["healthy", "attention", "critical", "unknown"],
      incident_severity: ["low", "medium", "high", "critical"],
      incident_status: ["open", "investigating", "resolved"],
      lead_status: ["new", "contacted", "won", "lost"],
      report_status: ["draft", "ready", "sent", "overdue"],
      site_status: ["active", "paused", "onboarding", "offboarded"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "pending",
      ],
      support_status: ["new", "in_progress", "answered", "closed"],
    },
  },
} as const
