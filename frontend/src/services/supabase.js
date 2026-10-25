// Re-export insforge client for backwards compatibility
import { insforge } from './insforge';

export const supabase = {
  auth: insforge.auth,
  from: (table) => insforge.database.from(table),
  storage: insforge.storage,
};

export default insforge;
