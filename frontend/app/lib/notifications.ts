export const enviarNotificacion = async (mensaje: string, tipo: 'info' | 'warning' | 'error') => {
  // Verificar si el navegador soporta notificaciones
  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones");
    return;
  }

  // Solicitar permiso
  if (Notification.permission !== "granted") {
    await Notification.requestPermission();
  }

  if (Notification.permission === "granted") {
    new Notification("Control de Inventario", {
      body: mensaje,
      icon: "/icon.png" // Agregar un ícono apropiado
    });
  }
};
