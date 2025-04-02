// utils/alert.ts
import Swal from 'sweetalert2'

// Tipos de alerta suportados
type AlertType = 'success' | 'error' | 'warning' | 'info' | 'question'

// Interface para opções básicas
interface AlertOptions {
  title?: string
  text?: string
  confirmButtonText?: string
  cancelButtonText?: string
}

// Interface para opções de confirmação
interface ConfirmOptions extends AlertOptions {
  confirmCallback: () => void
  cancelCallback?: () => void
}

// Alertas básicos
export const Alert = {
  
  // Alertas simples
  show: (options: AlertOptions & { type: AlertType }) => {
    return Swal.fire({
      icon: options.type,
      title: options.title || '',
      text: options.text,
      confirmButtonText: options.confirmButtonText || 'OK',
    })
  },

  // Sucesso
  success: (title: string, text?: string, options?: AlertOptions) => {
    return Alert.show({
      type: 'success',
      title,
      text,
      ...options,
    })
  },

  // Erro
  error: (title: string, text?: string, options?: AlertOptions) => {
    return Alert.show({
      type: 'error',
      title,
      text,
      ...options,
    })
  },

  // Aviso
  warning: (title: string, text?: string, options?: AlertOptions) => {
    return Alert.show({
      type: 'warning',
      title,
      text,
      ...options,
    })
  },

  // Informação
  info: (title: string, text?: string, options?: AlertOptions) => {
    return Alert.show({
      type: 'info',
      title,
      text,
      ...options,
    })
  },

  // Confirmação (Sim/Não)
  confirm: (title: string, text: string, options: ConfirmOptions) => {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText || 'Sim',
      cancelButtonText: options.cancelButtonText || 'Cancelar',
      reverseButtons: true,
    }).then(result => {
      if (result.isConfirmed) {
        options.confirmCallback()
      } else if (result.isDismissed && options.cancelCallback) {
        options.cancelCallback()
      }
    })
  },

  // Loading/Processando
  loading: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })
  },

  // Fechar alertas
  close: () => {
    Swal.close()
  },
}

export default Alert
