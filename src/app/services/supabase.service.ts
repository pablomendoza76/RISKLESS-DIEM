import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class SupabaseService {

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
      {
        auth: {
          //  DESACTIVAMOS AUTH COMPLETAMENTE
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            // evita comportamientos raros con caché
            'X-Client-Info': 'riskless-web'
          }
        }
      }
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}
