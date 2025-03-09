export const validarCedula = (cedula: string): boolean => {
  const cedulaRegex = /^\d{10}$/;
  if (!cedulaRegex.test(cedula)) return false;
  
  // Algoritmo de validación de cédula ecuatoriana
  const coeficientes = [2,1,2,1,2,1,2,1,2];
  const verificador = parseInt(cedula.charAt(9));
  
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
    if (valor > 9) valor -= 9;
    suma += valor;
  }
  
  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === verificador;
};

export const validarCorreo = (correo: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(correo);
};

export const validarContraseña = (password: string): { 
  valido: boolean; 
  mensaje: string 
} => {
  if (password.length < 8) {
    return { 
      valido: false, 
      mensaje: 'La contraseña debe tener al menos 8 caracteres' 
    };
  }
  if (!/[A-Z]/.test(password)) {
    return { 
      valido: false, 
      mensaje: 'La contraseña debe contener al menos una mayúscula' 
    };
  }
  if (!/[0-9]/.test(password)) {
    return { 
      valido: false, 
      mensaje: 'La contraseña debe contener al menos un número' 
    };
  }
  return { valido: true, mensaje: '' };
};
