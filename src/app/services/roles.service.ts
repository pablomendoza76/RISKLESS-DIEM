import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Rol {
  id: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class RolesService {

  constructor(private sb: SupabaseService) {}

  async listar(): Promise<Rol[]> {
    const { data, error } = await this.sb.client
      .from('roles')
      .select('id, nombre')
      .order('nombre');

    if (error) throw error;
    return data ?? [];
  }
}
