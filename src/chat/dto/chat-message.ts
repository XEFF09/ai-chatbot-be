export class ChatMessageRequestDTO {
  userId: string;
  message: string;
  agent: string;
  timestamp: Date = new Date();
}
