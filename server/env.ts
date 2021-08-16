export const TICK_RATE = Number(process.env.TICK_RATE) || 60
export const SEND_RATE = Number(process.env.SEND_RATE) || 10
export const PORT = Number(process.env.PORT) || 8000
export const INTERFACE = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'
export const MESSAGE_MAX_BYTE_LENGTH =
  Number(process.env.MESSAGE_MAX_BYTE_LENGTH) || Infinity
export const MAX_PLAYERS = 10