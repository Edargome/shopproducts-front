export function friendlyHttpError(err: any): string {
  const status = err?.status;

  if (status === 0) return 'No se pudo conectar con la API. Verifica que el backend esté corriendo.';
  if (status === 401) return 'Tu sesión no es válida o expiró. Inicia sesión nuevamente.';
  if (status === 403) return 'No tienes permisos para realizar esta acción.';
  if (status === 404) return 'No se encontró el recurso solicitado.';
  if (status === 409) return err?.error?.message ?? 'Conflicto: la operación no se puede completar.';
  if (status === 400) {
    const msg = err?.error?.message;
    if (Array.isArray(msg)) return msg.join(' • ');
    return msg ?? 'Solicitud inválida.';
  }
  return err?.error?.message ?? 'Ocurrió un error inesperado.';
}
