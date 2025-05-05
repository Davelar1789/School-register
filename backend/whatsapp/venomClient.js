import { create } from 'venom-bot';

let whatsappClient;

export const initializeWhatsApp = async () => {
  if (!whatsappClient) {
    whatsappClient = await create();
  }
  return whatsappClient;
};
